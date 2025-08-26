import fs from 'node:fs/promises'
import path from 'node:path'

import {
  base64,
  buffer,
  exists,
  karinPathBase,
  logger,
  Message,
  MessageResponse,
  mkdir,
  readFile
} from 'node-karin'

import { Config } from '@/common'
import { server } from '@/models'
import Request from '@/models/utils/request'
import { Version } from '@/root'
import type { AvatarInfoType, ImageInfoType } from '@/types'

/**
 * 获取基础 URL
 * @returns 基础 URL
 */
export async function get_base_url (): Promise<string> {
  try {
    let base_url:string
    if (!Config.server.url && !(Config.server.mode === 1)) throw new Error('请先使用未配置表情包API或使用本地服务')
    switch (Number(Config.server.mode)) {
      case 0:
        base_url = Config.server.url.replace(/\/+$/, '')
        break
      case 1:{
        const resources_path = path.join(karinPathBase, Version.Plugin_Name, 'data', 'memes', 'resources')
        if (!(await exists(resources_path))) {
          throw new Error('请先使用[#柠糖表情下载表情服务端资源]')
        }
        base_url = `http://127.0.0.1:${Config.server.port}`
        break
      }
      default:
        throw new Error('请检查服务器模式')
    }

    return Promise.resolve(base_url)
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

/**
 * 异步判断是否在海外环境
 * @returns 如果在海外环境返回 true，否则返回 false
 * @throws 如果获取 IP 位置失败，则抛出异常
 */
export async function isAbroad (): Promise<boolean> {
  const urls = [
    'https://blog.cloudflare.com/cdn-cgi/trace',
    'https://developers.cloudflare.com/cdn-cgi/trace',
    'https://hostinger.com/cdn-cgi/trace',
    'https://ahrefs.com/cdn-cgi/trace'
  ]

  try {
    const responses = await Promise.all(
      urls.map((url) => Request.get(url, null, null, 'text'))
    )
    const traceTexts = responses.map((res) => res.data).filter(Boolean)
    const traceLines = traceTexts
      .flatMap((text: string) =>
        text.split('\n').filter((line: string) => line)
      )
      .map((line) => line.split('='))

    const traceMap = Object.fromEntries(traceLines)
    return traceMap.loc !== 'CN'
  } catch (error) {
    throw new Error(`获取 IP 所在地区出错: ${(error as Error).message}`)
  }
}

/**
 * 获取用户头像
 * @param e 消息事件
 * @param userId 用户ID
 * @param type 返回类型 url 或 base64
 * @returns 用户头像
 */

export async function get_user_avatar (
  e: Message,
  userId: string,
  type: 'url' | 'base64' | 'buffer' = 'url'
): Promise<AvatarInfoType | null> {
  try {
    if (!e) throw new Error('消息事件不能为空')
    if (!userId) throw new Error('用户ID不能为空')

    const avatarDir = path.join(karinPathBase, Version.Plugin_Name, 'data', 'avatar')
    const cachePath = path.join(avatarDir, `${userId}.png`).replace(/\\/g, '/')

    if (Config.meme.cache && Number(Config.server.mode) === 1 && (await exists(cachePath))) {
      let avatarUrl: string
      try {
        avatarUrl = await e.bot.getAvatarUrl(userId)
      } catch {
        logger.warn('获取用户头像出错, 将使用api获取用户头像')
        avatarUrl = `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`
      }
      const headRes = await Request.head(avatarUrl)
      const lastModified = headRes.data['last-modified']
      const cacheStat = await fs.stat(cachePath)

      if (new Date(lastModified) <= cacheStat.mtime) {
        switch (type) {
          case 'base64': {
            const data = await readFile(cachePath)
            if (!data) throw new Error(`通过缓存获取用户头像失败: ${userId}`)
            return {
              userId,
              avatar: data.toString('base64')
            }
          }
          case 'buffer': {
            const data = await readFile(cachePath)
            if (!data) throw new Error(`通过缓存获取用户头像失败: ${userId}`)
            return {
              userId,
              avatar: data
            }
          }
          case 'url':
          default:
            return {
              userId,
              avatar: cachePath
            }
        }
      }
    }

    const avatarUrl = await e.bot.getAvatarUrl(userId)
    if (!avatarUrl) throw new Error(`获取用户头像失败: ${userId}`)

    if (Config.meme.cache && Number(Config.server.mode) === 1 && !(await exists(avatarDir))) {
      await mkdir(avatarDir)
    }

    const res = await Request.get(avatarUrl, {}, {}, 'arraybuffer')
    const avatarData = res.data

    if (Config.meme.cache && Number(Config.server.mode) === 1) {
      await fs.writeFile(cachePath, avatarData)
    }

    switch (type) {
      case 'base64':
        return {
          userId,
          avatar: avatarData.toString('base64')
        }
      case 'buffer':
        return {
          userId,
          avatar: avatarData
        }
      case 'url':
      default:
        return {
          userId,
          avatar: Config.meme.cache && Number(Config.server.mode) === 1 ? cachePath : avatarUrl
        }
    }
  } catch (error) {
    logger.error(error)
    return null
  }
}

/**
 * 获取用户昵称
 * @param e 消息事件
 * @param userId 用户 ID
 * @returns 用户昵称
 */
export async function get_user_name (
  e: Message,
  userId: string
): Promise<string> {
  try {
    let nickname: string | null = null
    let userInfo
    if (e.isGroup) {
      userInfo = await e.bot.getGroupMemberInfo(e.groupId, userId)
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      nickname = userInfo.card?.trim() || userInfo.nick?.trim() || null
    } else if (e.isPrivate) {
      userInfo = await e.bot.getStrangerInfo(userId)
      nickname = userInfo.nick.trim() ?? null
    } else {
      nickname = e.sender.nick.trim() ?? null
    }
    if (!nickname) throw new Error('获取用户昵称失败')
    return nickname
  } catch (error) {
    logger.error(`获取用户昵称失败: ${error}`)
    return '未知'
  }
}

/**
 * 获取用户性别
 * @param e 消息事件
 * @param userId 用户 ID
 * @returns 用户性别
 */
export async function get_user_gender (
  e: Message,
  userId: string
): Promise<string> {
  try {
    let sex: 'male' | 'female' | 'unknown' = 'unknown'
    let userInfo
    if (e.isGroup) {
      userInfo = await e.bot.getGroupMemberInfo(e.groupId, userId)
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      sex = userInfo.sex || userInfo.sex || 'unknown'
    } else if (e.isPrivate) {
      userInfo = await e.bot.getStrangerInfo(userId)
      sex = userInfo.sex ?? 'unknown'
    } else {
      sex = e.sender.sex ?? 'unknown'
    }
    if (!sex) throw new Error('获取用户性别失败')
    return sex
  } catch (error) {
    logger.error(`获取用户昵称失败: ${error}`)
    return 'unknown'
  }
}

/**
 * 获取图片
 * @param e 消息事件
 * @param type 返回类型 url 或 base64
 * @returns 图片数组信息
 */
export async function get_image (
  e: Message,
  type: 'url' | 'base64' | 'buffer' = 'url'
): Promise<ImageInfoType[]> {
  const imagesInMessage = e.elements
    .filter((m) => m.type === 'image')
    .map((img) => ({
      userId: e.sender.userId,
      image: img.file
    }))

  const tasks: Promise<ImageInfoType>[] = []

  let quotedImages: Array<ImageInfoType> = []
  let source: MessageResponse | null = null
  /**
   * 获取引用消息的内容
   */
  const replyId: string | null = e.replyId ?? e.elements.find((m) => m.type === 'reply')?.messageId ?? null

  if (replyId) {
    source = (await e.bot.getMsg(e.contact, replyId)) ?? null
  }

  /**
   * 提取引用消息中的图片
   */
  if (source) {
    quotedImages = source.elements
      .filter((m) => m.type === 'image')
      .map((img) => ({
        userId: source.sender.userId,
        image: img.file
      }))
  }

  /**
   * 处理引用消息中的图片
   */
  if (quotedImages.length > 0) {
    const quotedImagesPromises = quotedImages.map(async (item) => {
      switch (type) {
        case 'buffer':
          return {
            userId: item.userId,
            image: await buffer(item.image)
          }
        case 'base64':
          return {
            userId: item.userId,
            image: await base64(item.image)
          }
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.image.toString()
          }
      }
    })
    tasks.push(...quotedImagesPromises)
  }

  /**
   * 处理消息中的图片
   */
  if (imagesInMessage.length > 0) {
    const imagePromises = imagesInMessage.map(async (item) => {
      switch (type) {
        case 'buffer':
          return {
            userId: item.userId,
            image: await buffer(item.image)
          }
        case 'base64':
          return {
            userId: item.userId,
            image: await base64(item.image)
          }
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.image.toString()
          }
      }
    })
    tasks.push(...imagePromises)
  }

  const results = await Promise.allSettled(tasks)
  const images = results
    .filter(
      (res): res is PromiseFulfilledResult<ImageInfoType> =>
        res.status === 'fulfilled' && Boolean(res.value)
    )
    .map((res) => res.value)

  return images
}

/**
 * 判断是否是 rust 服务器
 * @returns 是否是 rust 服务器
 */
export async function isRustServer (): Promise<boolean> {
  const type = Number(Config.server.mode) === 1
    ? 2
    : Number(Config.server.serverType) ?? 0
  switch (type) {
    case 1:
      return false
    case 2:
      return true
    case 0:
    default:
      return (await server.get_meme_server_type()) === 'rust'
  }
}

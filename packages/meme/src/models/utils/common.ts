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
import Request from './request'
import { Version } from '@/root'
import type { AvatarInfoType, ImageInfoType } from '@/types'
import { getMeme, Image, OptionValue } from 'meme-generator'


/**
 * 获取用户头像
 * @param e 消息事件
 * @param userId 用户ID
 * @param type 返回类型 url 或 base64
 * @returns 用户头像
 */

export async function get_user_avatar<T extends 'url' | 'base64' | 'buffer' = 'url'>(
  e: Message,
  userId: string,
  type: T = 'url' as T
): Promise<AvatarInfoType<T> | null> {
  try {
    if (!e) throw new Error('消息事件不能为空')
    if (!userId) throw new Error('用户ID不能为空')

    const avatarDir = path.join(karinPathBase, Version.Plugin_Name, 'data', 'avatar')
    const cachePath = path.join(avatarDir, `${userId}.png`).replace(/\\/g, '/')

    if (Config.meme.cache && (await exists(cachePath))) {
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
              image: data.toString('base64')
            } as AvatarInfoType<T>
          }
          case 'buffer': {
            const data = await readFile(cachePath)
            if (!data) throw new Error(`通过缓存获取用户头像失败: ${userId}`)
            return {
              userId,
              image: data
            } as AvatarInfoType<T>
          }
          case 'url':
          default:
            return {
              userId,
              image: cachePath
            } as AvatarInfoType<T>
        }
      }
    }

    const avatarUrl = await e.bot.getAvatarUrl(userId)
    if (!avatarUrl) throw new Error(`获取用户头像失败: ${userId}`)

    if (Config.meme.cache && !(await exists(avatarDir))) {
      await mkdir(avatarDir)
    }

    const res = await Request.get(avatarUrl, {}, {}, 'arraybuffer')
    const avatarData = res.data

    if (Config.meme.cache) {
      await fs.writeFile(cachePath, avatarData)
    }

    switch (type) {
      case 'base64':
        return {
          userId,
          image: avatarData.toString('base64')
        } as AvatarInfoType<T>
      case 'buffer':
        return {
          userId,
          image: avatarData
        } as AvatarInfoType<T>
      case 'url':
      default:
        return {
          userId,
          image: Config.meme.cache ? cachePath : avatarUrl
        } as AvatarInfoType<T>
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
export async function get_user_name(
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
export async function get_user_gender(
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
export async function get_image<T extends 'url' | 'base64' | 'buffer' = 'url'>(
  e: Message,
  type: T = 'url' as T
): Promise<ImageInfoType<T>[]> {
  const imagesInMessage = e.elements
    .filter((m) => m.type === 'image')
    .map((img) => ({
      userId: e.sender.userId,
      image: img.file
    }))

  const tasks: Promise<ImageInfoType<T>>[] = []

  let quotedImages: Array<ImageInfoType<T>> = []
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
      })) as Array<ImageInfoType<T>>
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
          } as ImageInfoType<T>
        case 'base64':
          return {
            userId: item.userId,
            image: await base64(item.image)
          } as ImageInfoType<T>
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.image.toString()
          } as ImageInfoType<T>
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
          } as ImageInfoType<T>
        case 'base64':
          return {
            userId: item.userId,
            image: await base64(item.image)
          } as ImageInfoType<T>
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.image.toString()
          } as ImageInfoType<T>
      }
    })
    tasks.push(...imagePromises)
  }

  const results = await Promise.allSettled(tasks)
  const images = results
    .filter(
      (res): res is PromiseFulfilledResult<ImageInfoType<T>> =>
        res.status === 'fulfilled' && Boolean(res.value)
    )
    .map((res) => res.value)

  return images
}

/**
 * 生成表情图片
 * @param memekey 表情唯一标识符
 * @param data 表情数据
 * @returns 表情图片数据
 */
export async function make_meme(memekey: string, data: Record<string, unknown>): Promise<Buffer> {
  try {
    const meme = getMeme(memekey)
    if (!meme) throw new Error('未找到该表情: ' + memekey)
    const imgae = meme.generate(data['images'] as Image[], data['texts'] as string[], data['options'] as Record<string, OptionValue>)
    if (imgae.type === 'Ok') {
      return imgae.field0
    } else throw new Error(`生成表情图片失败: ${imgae.field0.type}:${JSON.stringify(imgae.field0.field0)}`)
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}
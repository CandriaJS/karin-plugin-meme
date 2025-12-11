import { base64, buffer, logger, Message, MessageResponse } from 'node-karin'

import { Config } from '@/common'
import Request from '@/models/utils/request'
import type { AvatarInfoType, ImageInfoType } from '@/types'

/**
 * 获取基础 URL
 * @returns 基础 URL
 */
export async function getBaseUrl(): Promise<string> {
  try {
    if (!Config.server.url) throw new Error('请先配置表情包API服务地址')
    const base_url = Config.server.url.replace(/\/+$/, '')
    return Promise.resolve(base_url)
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

/**
 * 获取用户头像
 * @param e 消息事件
 * @param userId 用户ID
 * @param type 返回类型 url 或 base64
 * @returns 用户头像
 */

export async function getUserAvatar<
  T extends 'url' | 'base64' | 'buffer' = 'url',
>(e: Message, userId: string, type?: T): Promise<AvatarInfoType<T> | null> {
  try {
    if (!e) throw new Error('消息事件不能为空')
    if (!userId) throw new Error('用户ID不能为空')

    const avatarUrl = await e.bot.getAvatarUrl(userId)
    if (!avatarUrl) throw new Error(`获取用户头像失败: ${userId}`)

    const res = await Request.get(avatarUrl, {}, {}, 'arraybuffer')
    const avatarData = res.data

    switch (type) {
      case 'base64':
        return {
          userId,
          avatar: avatarData.toString('base64'),
        } as AvatarInfoType<T>
      case 'buffer':
        return {
          userId,
          avatar: avatarData,
        } as AvatarInfoType<T>
      case 'url':
      default:
        return {
          userId,
          avatar: avatarUrl,
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
export async function getUserAame(e: Message, userId: string): Promise<string> {
  try {
    let nickname: string | null = null
    let userInfo
    if (e.isGroup) {
      userInfo = await e.bot.getGroupMemberInfo(e.groupId, userId)
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
export async function getUserGender(
  e: Message,
  userId: string,
): Promise<string> {
  try {
    let sex: 'male' | 'female' | 'unknown' = 'unknown'
    let userInfo
    if (e.isGroup) {
      userInfo = await e.bot.getGroupMemberInfo(e.groupId, userId)
      sex = userInfo.sex || 'unknown'
    } else if (e.isPrivate) {
      userInfo = await e.bot.getStrangerInfo(userId)
      sex = userInfo.sex || 'unknown'
    } else {
      sex = e.sender.sex || 'unknown'
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
export async function getImage(
  e: Message,
  type: 'url' | 'base64' | 'buffer' = 'url',
): Promise<ImageInfoType[]> {
  const imagesInMessage = e.elements
    .filter((m) => m.type === 'image')
    .map((img) => ({
      userId: e.sender.userId,
      image: img.file,
    }))

  const tasks: Promise<ImageInfoType>[] = []

  let quotedImages: Array<ImageInfoType> = []
  let source: MessageResponse | null = null
  /**
   * 获取引用消息的内容
   */
  const replyId: string | null =
    e.replyId ?? e.elements.find((m) => m.type === 'reply')?.messageId ?? null

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
        image: img.file,
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
            image: await buffer(item.image),
          }
        case 'base64':
          return {
            userId: item.userId,
            image: await base64(item.image),
          }
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.image.toString(),
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
            image: await buffer(item.image),
          }
        case 'base64':
          return {
            userId: item.userId,
            image: await base64(item.image),
          }
        case 'url':
        default:
          return {
            userId: item.userId,
            image: item.image.toString(),
          }
      }
    })
    tasks.push(...imagePromises)
  }

  const results = await Promise.allSettled(tasks)
  const images = results
    .filter(
      (res): res is PromiseFulfilledResult<ImageInfoType> =>
        res.status === 'fulfilled' && Boolean(res.value),
    )
    .map((res) => res.value)

  return images
}

/**
 * 获取表情服务器类型
 * @returns 服务器类型 'python' 或 'rust'
 */
export async function get_meme_server_type(): Promise<'python' | 'rust'> {
  const type = Number(Config.server.serverType) || 0
  switch (type) {
    case 1:
      return 'python'
    case 2:
      return 'rust'
    case 0:
    default: {
      try {
        const url = await getBaseUrl()
        const res = await Request.get(`${url}/meme/infos`)
        return res.success ? 'rust' : 'python'
      } catch {
        return 'python'
      }
    }
  }
}

/**
 * 判断是否是 rust 服务器
 * @returns 是否是 rust 服务器
 */
export async function isRustServer(): Promise<boolean> {
  return (await get_meme_server_type()) === 'rust'
}

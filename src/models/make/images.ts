import { config, Message } from 'node-karin'

import { Config } from '@/common'
import { utils } from '@/models'

export async function handleImages (
  e: Message,
  memeKey: string,
  min_images: number,
  max_images: number,
  allUsers: string[],
  quotedUser: string | null,
  userText: string,
  formdata: Record<string, unknown>
): Promise<
| { success: true, text: string }
| { success: false, message: string }
> {
  let images = []
  const messageImages = await utils.get_image(e, 'url')
  let userAvatars: Array<{ name: string, id: string }> = []

  const imagePromises = messageImages.map(async (msgImage) => {
    const [image, name] = await Promise.all([
      utils.upload_image(msgImage.image, 'url'),
      utils.get_user_name(e, msgImage.userId)
    ])
    return {
      name,
      id: image
    }
  })
  images = await Promise.all(imagePromises)

  if (allUsers.length > 0) {
    let avatar = await utils.get_user_avatar(e, allUsers[0], 'url')
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }

    const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
    const image = await utils.upload_image(avatar.avatar, type)

    if (image) {
      userAvatars.push({
        name: await utils.get_user_name(e, avatar.userId),
        id: image
      })
    }
  }

  /** 获取引用消息的头像 */
  if (messageImages.length === 0 && quotedUser) {
    let avatar = await utils.get_user_avatar(e, quotedUser, 'url')
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }

    const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
    const image = await utils.upload_image(avatar.avatar, type)

    if (image) {
      userAvatars.push({
        name: await utils.get_user_name(e, avatar.userId),
        id: image
      })
    }
  }

  /**
   * 特殊处理：当 min_images === 1 时，因没有多余的图片，表情保护功能会失效
   */
  if (min_images === 1 && messageImages.length === 0) {
    let avatar = await utils.get_user_avatar(e, e.userId, 'url')
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }

    const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
    const image = await utils.upload_image(avatar.avatar, type)

    if (image) {
      userAvatars.push({
        name: await utils.get_user_name(e, avatar.userId),
        id: image
      })
    }
  }

  if (images.length + userAvatars.length < min_images) {
    let avatar = await utils.get_user_avatar(e, e.userId, 'url')
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }

    const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
    const image = await utils.upload_image(avatar.avatar, type)

    if (image) {
      userAvatars.unshift({
        name: await utils.get_user_name(e, avatar.userId),
        id: image
      })
    }
  }

  /** 表情保护逻辑 */
  if (Config.protect.enable) {
    const protectList = Config.protect.list
    if (protectList.length > 0) {
      /** 处理表情保护列表可能含有关键词 */
      const memeKeys = await Promise.all(protectList.map(async item => {
        const key = await utils.get_meme_key_by_keyword(item)
        return key ?? item
      }))
      if (memeKeys.includes(memeKey)) {
        const allProtectedUsers = [...allUsers, ...(quotedUser ? [quotedUser] : [])]

        if (allProtectedUsers.length > 0) {
          const masterQQArray = config.master()
          /** 优先检查引用消息的用户 */
          const protectUser = quotedUser ??
            (allProtectedUsers.length === 1 ? allProtectedUsers[0] : allProtectedUsers[1])
          if (!e.isMaster) {
            if (Config.protect.master) {
              if (masterQQArray.includes(protectUser)) {
                userAvatars.reverse()
              }
            }
            if (Config.protect.userEnable) {
              const protectUsers = Array.isArray(Config.protect.user)
                ? Config.protect.user.map(String)
                : [String(Config.protect.user)]
              if (protectUsers.includes(protectUser)) {
                userAvatars.reverse()
              }
            }
          }
        }
      }
    }
  }

  images = [...userAvatars, ...images].slice(0, max_images)
  formdata['images'] = images

  return images.length < min_images
    ? {
        success: false,
        message: min_images === max_images
          ? `该表情需要${min_images}张图片`
          : `该表情至少需要 ${min_images} ~ ${max_images} 张图片`
      }
    : {
        success: true,
        text: userText
      }
}

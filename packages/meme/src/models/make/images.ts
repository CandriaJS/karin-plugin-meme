import { config, Message } from 'node-karin'

import { Config } from '@/common'
import { utils } from '@/models'
import { Image } from 'meme-generator'

export async function handleImages(
  e: Message,
  memeKey: string,
  min_images: number,
  max_images: number,
  allUsers: string[],
  quotedUser: string | null,
  userText: string,
  formdata: Record<string, unknown> | FormData,
  customNames: string[] = [],
): Promise<
  { success: true; text: string } | { success: false; message: string }
> {
  let images: Array<Image> = []
  const getType = 'buffer'

  const messageImages = await utils.getImage(e, getType)
  let userAvatars: Array<Image> = []

  const imagePromises = messageImages.map(async (msgImage) => {
    const name = await utils.getUserName(e, msgImage.userId)
    return {
      name,
      data: msgImage.image,
    }
  })
  images = await Promise.all(imagePromises)

  if (allUsers.length > 0) {
    let avatar = await utils.geUserAvatar(e, allUsers[0], getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败',
      }
    }
    userAvatars.push({
      name: await utils.getUserName(e, avatar.userId),
      data: avatar.image,
    })
  }

  /** 获取引用消息的头像 */
  if (messageImages.length === 0 && quotedUser) {
    let avatar = await utils.geUserAvatar(e, quotedUser, getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败',
      }
    }

    userAvatars.push({
      name: await utils.getUserName(e, avatar.userId),
      data: avatar.image,
    })
  }

  /**
   * 特殊处理：当 min_images === 1 时，因没有多余的图片，表情保护功能会失效
   */
  if (min_images === 1 && messageImages.length === 0) {
    let avatar = await utils.geUserAvatar(e, e.userId, getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败',
      }
    }
    userAvatars.push({
      name: await utils.getUserName(e, avatar.userId),
      data: avatar.image,
    })
  }

  if (images.length + userAvatars.length < min_images) {
    let avatar = await utils.geUserAvatar(e, e.userId, getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败',
      }
    }

    userAvatars.unshift({
      name: await utils.getUserName(e, avatar.userId),
      data: avatar.image,
    })
  }

  /** 表情保护逻辑 */
  if (Config.protect.enable) {
    if (Config.protect.memeAll) {
      const allProtectedUsers = [
        ...allUsers,
        ...(quotedUser ? [quotedUser] : []),
      ]

      if (allProtectedUsers.length > 0) {
        const masterQQArray = config.master()
        const protectUser =
          quotedUser ??
          (allProtectedUsers.length === 1
            ? allProtectedUsers[0]
            : allProtectedUsers[1])
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
    } else {
      const protectList = Config.protect.list
      if (protectList.length > 0) {
        const memeKeys = await Promise.all(
          protectList.map(async (item) => {
            const key = await utils.get_meme_key_by_keyword(item)
            return key ?? item
          }),
        )
        if (memeKeys.includes(memeKey)) {
          const allProtectedUsers = [
            ...allUsers,
            ...(quotedUser ? [quotedUser] : []),
          ]

          if (allProtectedUsers.length > 0) {
            const masterQQArray = config.master()
            const protectUser =
              quotedUser ??
              (allProtectedUsers.length === 1
                ? allProtectedUsers[0]
                : allProtectedUsers[1])
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
  }

  images = [...userAvatars, ...images].slice(0, max_images)

  /** 应用用户自定义名称 */
  if (customNames.length > 0) {
    images = images.map((img, index) => ({
      ...img,
      name: customNames[index] ?? img.name,
    }))
  }

  ;(formdata as Record<string, unknown>).images = images

  return images.length < min_images
    ? {
        success: false,
        message:
          min_images === max_images
            ? `该表情需要${min_images}张图片`
            : `该表情至少需要 ${min_images} ~ ${max_images} 张图片`,
      }
    : {
        success: true,
        text: userText,
      }
}

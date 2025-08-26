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
  formdata: Record<string, unknown> | FormData,
  isRust: boolean
): Promise<
  { success: true; text: string } | { success: false; message: string }
> {
  let images: Array<{ name: string; id: string }> | Buffer[] = []
  const getType = isRust
    ? Config.server.usebase64
      ? 'base64'
      : 'url'
    : 'buffer'
  const AvatarUploadType = isRust && Config.server.usebase64
    ? 'data'
    : Number(Config.server.mode) === 1 && Config.meme.cache
      ? 'path'
      : 'url'
  const uploadType = Config.server.usebase64 ? 'data' : 'url'

  const messageImages = await utils.get_image(e, getType)
  let userAvatars: Array<{ name: string; id: string } | Buffer> = []

  if (isRust) {
    const imagePromises = messageImages.map(async (msgImage) => {
      const [image, name] = await Promise.all([
        utils.upload_image({ image: msgImage.image, type: uploadType }),
        utils.get_user_name(e, msgImage.userId)
      ])
      return {
        name,
        id: image
      }
    })
    images = await Promise.all(imagePromises)
  } else {
    images = messageImages.map(msgImage => msgImage.image as Buffer)
  }

  if (allUsers.length > 0) {
    let avatar = await utils.get_user_avatar(e, allUsers[0], getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }
    if (isRust) {
      const image = await utils.upload_image({ image: avatar.avatar, type: AvatarUploadType })
      if (image) {
        userAvatars.push({
          name: await utils.get_user_name(e, avatar.userId),
          id: image
        })
      }
    } else {
      userAvatars.push(avatar.avatar as Buffer)
    }
  }

  /** 获取引用消息的头像 */
  if (messageImages.length === 0 && quotedUser) {
    let avatar = await utils.get_user_avatar(e, quotedUser, getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }

    if (isRust) {
      const image = await utils.upload_image({ image: avatar.avatar, type: AvatarUploadType })
      if (image) {
        userAvatars.push({
          name: await utils.get_user_name(e, avatar.userId),
          id: image
        })
      }
    } else {
      userAvatars.push(avatar.avatar as Buffer)
    }
  }

  /**
   * 特殊处理：当 min_images === 1 时，因没有多余的图片，表情保护功能会失效
   */
  if (min_images === 1 && messageImages.length === 0) {
    let avatar = await utils.get_user_avatar(e, e.userId, getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }
    if (isRust) {
      const image = await utils.upload_image({ image: avatar.avatar, type: AvatarUploadType })

      if (image) {
        userAvatars.push({
          name: await utils.get_user_name(e, avatar.userId),
          id: image
        })
      }
    } else {
      userAvatars.push(avatar.avatar as Buffer)
    }
  }

  if (images.length + userAvatars.length < min_images) {
    let avatar = await utils.get_user_avatar(e, e.userId, getType)
    if (!avatar) {
      return {
        success: false,
        message: '获取用户头像失败'
      }
    }

    if (isRust) {
      const image = await utils.upload_image({ image: avatar.avatar, type: AvatarUploadType })
      if (image) {
        userAvatars.unshift({
          name: await utils.get_user_name(e, avatar.userId),
          id: image
        })
      }
    } else {
      userAvatars.unshift(avatar.avatar as Buffer)
    }
  }

  /** 表情保护逻辑 */
  if (Config.protect.enable) {
    if (Config.protect.memeAll) {
      const allProtectedUsers = [
        ...allUsers,
        ...(quotedUser ? [quotedUser] : [])
      ];

      if (allProtectedUsers.length > 0) {
        const masterQQArray = config.master();
        const protectUser =
          quotedUser ??
          (allProtectedUsers.length === 1
            ? allProtectedUsers[0]
            : allProtectedUsers[1]);
        if (!e.isMaster) {
          if (Config.protect.master) {
            if (masterQQArray.includes(protectUser)) {
              userAvatars.reverse();
            }
          }
          if (Config.protect.userEnable) {
            const protectUsers = Array.isArray(Config.protect.user)
              ? Config.protect.user.map(String)
              : [String(Config.protect.user)];
            if (protectUsers.includes(protectUser)) {
              userAvatars.reverse();
            }
          }
        }
      }
    } else {
      const protectList = Config.protect.list;
      if (protectList.length > 0) {
        const memeKeys = await Promise.all(
          protectList.map(async (item) => {
            const key = await utils.get_meme_key_by_keyword(item);
            return key ?? item;
          })
        );
        if (memeKeys.includes(memeKey)) {
          const allProtectedUsers = [
            ...allUsers,
            ...(quotedUser ? [quotedUser] : [])
          ];

          if (allProtectedUsers.length > 0) {
            const masterQQArray = config.master();
            const protectUser =
              quotedUser ??
              (allProtectedUsers.length === 1
                ? allProtectedUsers[0]
                : allProtectedUsers[1]);
            if (!e.isMaster) {
              if (Config.protect.master) {
                if (masterQQArray.includes(protectUser)) {
                  userAvatars.reverse();
                }
              }
              if (Config.protect.userEnable) {
                const protectUsers = Array.isArray(Config.protect.user)
                  ? Config.protect.user.map(String)
                  : [String(Config.protect.user)];
                if (protectUsers.includes(protectUser)) {
                  userAvatars.reverse();
                }
              }
            }
          }
        }
      }
    }
  }
  if (isRust) {
    images = [...userAvatars, ...images].slice(0, max_images) as Array<{ name: string; id: string }>
  } else {
    images = [...userAvatars, ...images].slice(0, max_images) as Buffer[]
  }
  if (isRust) {
    (formdata as Record<string, unknown>).images = images
  } else {
    (images as Buffer[]).forEach((buffer, index) => {
      const uint8Array = new Uint8Array(buffer);
      const blob = new Blob([uint8Array], { type: 'image/png' })
      const fd = formdata as FormData
      fd.append('images', blob, `image${index}.png`)
    })
  }

  return images.length < min_images
    ? {
        success: false,
        message:
          min_images === max_images
            ? `该表情需要${min_images}张图片`
            : `该表情至少需要 ${min_images} ~ ${max_images} 张图片`
      }
    : {
        success: true,
        text: userText
      }
}

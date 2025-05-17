import karin, { common, logger, Message, segment } from 'node-karin'

import { Config } from '@/common'
import { imageTool, utils } from '@/models'
import { Version } from '@/root'

export const flip_horizontal = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:水平翻转)(?:图片)?$/i, async (e: Message) => {
  try {
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    const reslut = await imageTool.flip_horizontal(image_id)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`水平翻转图片失败:: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:水平翻转',
  priority: -Infinity,
  event: 'message'
})

export const flip_vertical = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:垂直翻转)(?:图片)?$/i, async (e: Message) => {
  try {
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    const reslut = await imageTool.flip_vertical(image_id)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]垂直翻转图片图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:垂直翻转',
  priority: -Infinity,
  event: 'message'
})

export const rotate = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:旋转)(?:图片)?(?:\s*(\d+))?$/i, async (e: Message) => {
  try {
    const [, angle] = e.msg.match(rotate.reg)!
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    if (!angle) {
      return await e.reply('请输入旋转角度')
    }
    const reslut = await imageTool.rotate(image_id, parseInt(angle))
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]旋转图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:旋转',
  priority: -Infinity,
  event: 'message'
})

export const resize = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:缩放)(?:图片)?(?:\s*(\d+)(?:x(\d+)?|%)?)?$/i, async (e: Message) => {
  try {
    const [, width, height] = e.msg.match(resize.reg)!
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    if (!width) {
      return await e.reply('请输入正确的尺寸格式, 如:100x100,100x,50%')
    }

    const image_info = await imageTool.get_image_info(image_id)
    let finalWidth: number
    let finalHeight: number

    if (width.endsWith('%')) {
      /** 百分比缩放 */
      const scale = parseInt(width) / 100
      finalWidth = Math.floor(image_info.width * scale)
      finalHeight = Math.floor(image_info.height * scale)
    } else {
      /** 固定尺寸缩放 */
      finalWidth = parseInt(width)
      finalHeight = height ? parseInt(height) : Math.floor(image_info.height * (finalWidth / image_info.width))
    }

    const reslut = await imageTool.resize(image_id, finalWidth, finalHeight)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]缩放图片失败:${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:缩放',
  priority: -Infinity,
  event: 'message'
})

export const crop = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:裁剪)(?:图片)?(?:\s*([\d:x,]+))?$/i, async (e: Message) => {
  try {
    const [, cropParam] = e.msg.match(crop.reg)!
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    if (!cropParam) {
      return await e.reply('请输入正确的裁剪格式 ,如:[0,0,100,100],[100x100],[2:1]')
    }

    const image_info = await imageTool.get_image_info(image_id)
    let left: number, top: number, right: number, bottom: number

    if (cropParam.includes(',')) {
      [left, top, right, bottom] = cropParam.split(',').map(n => parseInt(n))
    } else if (cropParam.includes('x')) {
      const [width, height] = cropParam.split('x').map(n => parseInt(n))
      left = 0
      top = 0
      right = width
      bottom = height
    } else if (cropParam.includes(':')) {
      const [widthRatio, heightRatio] = cropParam.split(':').map(n => parseInt(n))
      const ratio = widthRatio / heightRatio
      if (image_info.width / image_info.height > ratio) {
        const newWidth = Math.floor(image_info.height * ratio)
        left = Math.floor((image_info.width - newWidth) / 2)
        top = 0
        right = left + newWidth
        bottom = image_info.height
      } else {
        const newHeight = Math.floor(image_info.width / ratio)
        left = 0
        top = Math.floor((image_info.height - newHeight) / 2)
        right = image_info.width
        bottom = top + newHeight
      }
    } else {
      return await e.reply('请输入正确的裁剪格式 ,如:[0,0,100,100],[100x100],[2:1]')
    }

    const reslut = await imageTool.crop(image_id, left, top, right, bottom)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]裁剪图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:裁剪',
  priority: -Infinity,
  event: 'message'
})

export const grayscale = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:灰度化)(?:图片)?$/i, async (e: Message) => {
  try {
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    const reslut = await imageTool.grayscale(image_id)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]灰度化图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:灰度化',
  priority: -Infinity,
  event: 'message'
})

export const invert = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:反色)(?:图片)?$/i, async (e: Message) => {
  try {
    let avatar, image, image_id
    avatar = await utils.get_user_avatar(e, e.at[0], 'url')
    if (avatar) {
      const type = Number(Config.server.mode) === 1 && Config.meme.cache ? 'path' : 'url'
      image_id = await utils.upload_image(avatar.avatar, type)
    } else {
      image = await utils.get_image(e)
      image_id = image && image.length > 0 ? await utils.upload_image(image[0].image) : null
    }

    if (!image_id) {
      return await e.reply('请发送图片', { reply: true })
    }
    const reslut = await imageTool.invert(image_id)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]反色图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:反色',
  priority: -Infinity,
  event: 'message'
})

export const merge_horizontal = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:水平拼接)(?:图片)?$/i, async (e: Message) => {
  try {
    const images = await utils.get_image(e, 'url')
    if (!images || images.length < 2) {
      return await e.reply('请发送至少两张图片进行合并', { reply: true })
    }
    const image_ids = await Promise.all(
      images.map(img => utils.upload_image(img.image))
    )
    const reslut = await imageTool.merge_horizontal(image_ids)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]水平拼接图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:水平拼接',
  priority: -Infinity,
  event: 'message'
})

export const merge_vertical = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:垂直拼接)(?:图片)?$/i, async (e: Message) => {
  try {
    const images = await utils.get_image(e, 'url')
    if (!images || images.length < 2) {
      return await e.reply('请发送至少两张图片进行垂直拼接', { reply: true })
    }
    const image_ids = await Promise.all(
      images.map(img => utils.upload_image(img.image))
    )
    const reslut = await imageTool.merge_vertical(image_ids)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]垂直拼接图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:垂直拼接',
  priority: -Infinity,
  event: 'message'
})

export const gif_split = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:分解)$/i, async (e: Message) => {
  try {
    const image = await utils.get_image(e, 'url')
    if (!image) {
      return await e.reply('请发送图片', { reply: true })
    }
    const image_id = await utils.upload_image(image[0].image)
    const reslut = await imageTool.gif_split(image_id)

    const images = await Promise.all(
      reslut.map(id => imageTool.get_image(id, 'base64'))
    )

    const replyMessage = [
      segment.text('============\n'),
      segment.text('原图:\n'),
      segment.image(`base64://${await imageTool.get_image(image_id, 'base64')}`),
      segment.text('============\n'),
      segment.text('分解后的图片:\n'),
      ...images.map(img => segment.image(`base64://${img}`))
    ]

    const forWordMsg = common.makeForward(replyMessage, e.bot.selfId, e.bot.selfName)

    await e.bot.sendForwardMsg(e.contact, forWordMsg, {
      news: [{ text: 'GIF分解' }],
      prompt: 'GIF分解',
      summary: Version.Plugin_AliasName,
      source: 'GIF分解'
    })
  } catch (error) {
    logger.error(error)
    await e.reply(`GIF分解失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:GIF分解',
  priority: -Infinity,
  event: 'message'
})

export const gif_merge = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:合并|拼接)$/i, async (e: Message) => {
  try {
    const images = await utils.get_image(e, 'url')
    if (!images || images.length < 2) {
      return await e.reply('请发送至少两张图片进行分解', { reply: true })
    }
    const image_ids = await Promise.all(
      images.map(img => utils.upload_image(img.image))
    )
    const reslut = await imageTool.gif_merge(image_ids)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]gif拼接图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:gif合并',
  priority: -Infinity,
  event: 'message'
})

export const gif_reverse = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:反转)$/i, async (e: Message) => {
  try {
    const image = await utils.get_image(e, 'url')
    if (!image) {
      return await e.reply('请发送图片', { reply: true })
    }
    const image_id = await utils.upload_image(image[0].image)
    const reslut = await imageTool.gif_reverse(image_id)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]gif反转图片失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:gif反转',
  priority: -Infinity,
  event: 'message'
})

export const gif_change_duration = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:gif)?(?:变速|改变帧率)(?:\s*(\d{0,3}\.?\d{1,3}(?:fps|ms|s|x|倍速?|%)?))?$/i, async (e: Message) => {
  try {
    const [, param] = e.msg.match(gif_change_duration.reg)!
    const image = await utils.get_image(e, 'url')
    if (!image) {
      return await e.reply('请发送图片', { reply: true })
    }
    if (!param) {
      return await e.reply('请使用正确的倍率格式,如:[0.5x],[50%],[20FPS],[0.05s]', { reply: true })
    }
    const image_id = await utils.upload_image(image[0].image)
    const image_info = await imageTool.get_image_info(image_id)
    if (!image_info.is_multi_frame) {
      return await e.reply('该图片不是动图,无法进行变速操作', { reply: true })
    }
    let duration: number

    const fps_match = param.match(/(\d{0,3}\.?\d{1,3})fps$/i)
    const time_match = param.match(/(\d{0,3}\.?\d{1,3})(m?)s$/i)
    const speed_match = param.match(/(\d{0,3}\.?\d{1,3})(?:x|倍速?)$/i)
    const percent_match = param.match(/(\d{0,3}\.?\d{1,3})%$/)

    if (fps_match) {
      duration = 1 / parseFloat(fps_match[1])
    } else if (time_match) {
      duration = time_match[2] ? parseFloat(time_match[1]) / 1000 : parseFloat(time_match[1])
    } else {
      duration = image_info.average_duration

      if (speed_match) {
        duration /= parseFloat(speed_match[1])
      } else if (percent_match) {
        duration = duration * (100 / parseFloat(percent_match[1]))
      } else {
        return await e.reply('请使用正确的倍率格式,如:0.5x,50%,20FPS,0.05s')
      }
    }

    if (duration < 0.02) {
      return await e.reply([
        segment.text('帧间隔必须大于 0.02 s(小于等于 50 FPS),\n'),
        segment.text('超过该限制可能会导致 GIF 显示速度不正常.\n'),
        segment.text(`当前帧间隔为 ${duration.toFixed(3)} s (${(1 / duration).toFixed(1)} FPS)`)
      ])
    }

    const reslut = await imageTool.gif_change_duration(image_id, duration)
    await e.reply([segment.image(`base64://${await imageTool.get_image(reslut, 'base64')}`)])
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]GIF变速失败: ${(error as Error).message}`)
  }
}, {
  name: '柠糖表情:图片操作:GIF变速',
  priority: -Infinity,
  event: 'message'
})

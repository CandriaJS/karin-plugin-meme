import karin, { logger, Message, segment } from 'node-karin'

import { imageTool, utils } from '@/models'

export const info = karin.command(/^#?(?:(?:柠糖)(?:表情|meme))?(?:查看)?(?:图片信息|imageinfo)$/i, async (e: Message) => {
  try {
    const image = await utils.get_image(e, 'url')
    if (!image) {
      return await e.reply('请发送图片', { reply: true })
    }
    const image_id = await utils.upload_image(image[0].image)
    const image_info = await imageTool.get_image_info(image_id)
    const replyMessage = [
      segment.image(`base64://${await imageTool.get_image(image_id, 'base64')}`),
      segment.text('图片信息:\n'),
      segment.text(`分辨率: ${image_info.width}x${image_info.height}\n`),
      segment.text(`是否为动图: ${image_info.is_multi_frame}\n`)
    ]
    if (image_info.is_multi_frame) {
      replyMessage.push(segment.text(`帧数: ${image_info.frame_count}\n`))
      replyMessage.push(segment.text(`动图平均帧率: ${image_info.average_duration}\n`))
    }
    await e.reply(replyMessage, { reply: true })
  } catch (error) {
    logger.error(error)
    await e.reply(`获取图片信息失败: ${(error as Error).message}`, { reply: true })
  }
}, {
  name: '柠糖表情:图片操作:查看图片信息',
  priority: -Infinity,
  event: 'message'
})

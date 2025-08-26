import { Resources } from 'meme-generator'
import karin, { Message } from 'node-karin'

export const download = karin.command(/^#?(?:(?:柠糖)?表情)(下载|更新)表情资源$/i, async (e: Message) => {
  Resources.checkResourcesInBackground()
  await e.reply('表情资源下载/更新任务已启动，请稍后查看日志')
}, {
  name: '柠糖表情:下载表情资源',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})
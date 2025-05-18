import karin from 'node-karin'

import { Config, Render } from '@/common'
import { db, utils } from '@/models'

export const staat = karin.command(/^#?(?:(?:柠糖)?表情)(?:调用)?统计$/i, async (e) => {
  if (!Config.stat.enable) return await e.reply('统计功能未开启')
  let statsData
  if (e.isGroup) {
    statsData = await db.stat.getAllByGroupId(e.groupId)
  } else {
    statsData = await db.stat.getAll()
  }
  if (!statsData || statsData.length === 0) {
    return await e.reply('当前没有统计数据')
  }
  let total = 0
  const formattedStats: { keywords: string; count: number }[] = []

  await Promise.all(statsData.map(async (data) => {
    const { memeKey, count } = data
    total += count
    const keywords = await utils.get_meme_keyword(memeKey)
    if (keywords?.length) {
      formattedStats.push({ keywords: keywords.join(', '), count })
    }
  }))

  formattedStats.sort((a, b) => b.count - a.count)

  const img = await Render.render('stat/index', {
    total,
    memeList: formattedStats
  })

  await e.reply(img)
  return true
}, {
  name: '柠糖表情:统计',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})

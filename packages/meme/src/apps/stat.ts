import karin, { segment } from 'node-karin'

import { Config, Render } from '@/common'
import { db, utils } from '@/models'

export const staat = karin.command(
  /^#?(?:(?:柠糖)?表情)(?:调用)?统计$/i,
  async (e) => {
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
    const memeKeyMap = new Map<string, number>()

    statsData.forEach((data) => {
      const { memeKey, count } = data
      memeKeyMap.set(memeKey, (memeKeyMap.get(memeKey) ?? 0) + count)
    })

    await Promise.all(
      [...memeKeyMap.entries()].map(async ([memeKey, count]) => {
        total += count
        const allKeywords = [
          ...new Set([
            ...((await utils.get_meme_keyword(memeKey)) ?? []),
            ...((await utils.get_preset_keyword(memeKey)) ?? []),
          ]),
        ]
        if (allKeywords?.length) {
          formattedStats.push({ keywords: allKeywords.join(', '), count })
        }
      }),
    )

    formattedStats.sort((a, b) => b.count - a.count)

    const img = await Render.stat({
      total,
      memeList: formattedStats,
    })

    await e.reply(segment.image(`base64://${img.toString('base64')}`))
    return true
  },
  {
    name: '柠糖表情:统计',
    priority: -Infinity,
    event: 'message',
    permission: 'all',
  },
)

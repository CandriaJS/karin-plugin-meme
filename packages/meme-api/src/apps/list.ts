import karin, { logger, Message, common } from 'node-karin'

import { Config, Render } from '@/common'
import { utils } from '@/models'
import { Version } from '@/root'

export const list = karin.command(/^#?(?:(?:柠糖)?(?:表情|(?:meme(?:s)?)))列表$/i, async (e: Message) => {
  if (!Config.meme.enable) return false
  try {
    const keys = await utils.get_meme_all_keys()
    if (!keys || keys.length === 0) {
      await e.reply(`[${Version.Plugin_AliasName}]没有找到表情列表, 请使用[#柠糖表情更新资源], 稍后再试`, { reply: true })
      return true
    }
    const tasks = keys.map(async (key) => {
      const keywords = await utils.get_meme_keyword(key) ?? []
      const params = await utils.get_meme_info(key)

      const min_texts = params?.min_texts ?? 0
      const min_images = params?.min_images ?? 0
      const options = params?.options ?? null
      const types: string[] = []
      if (min_texts >= 1) types.push('text')
      if (min_images >= 1) types.push('image')
      if (options !== null) types.push('option')

      if (keywords.length > 0) {
        return {
          name: keywords.join('/'),
          types
        }
      }

      return []
    })
    const memeListAll = (await Promise.all(tasks)).flat()
    const total = memeListAll.length

    const pageSize = 100
    const pageCount = Math.ceil(total / pageSize)
    const renderTasks = Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const memeList = memeListAll.slice(start, end)

      return Render.render('list/index', {
        memeList,
        total,
        page,
        pageCount
      })
    })

    const imgs = await Promise.all(renderTasks)
    const msg = common.makeForward(imgs, e.bot.account.selfId, e.bot.account.name)
    await e.bot.sendForwardMsg(e.contact, msg, { news: [{ text: '柠糖表情列表' }], prompt: '柠糖表情列表', summary: Version.Plugin_Name, source: '柠糖表情列表' })
    return true
  } catch (error) {
    logger.error(error)
  }
},{
  name: '柠糖表情:表情列表',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})
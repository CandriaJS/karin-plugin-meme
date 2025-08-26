import { components } from 'node-karin'

import { utils } from '@/models'
export async function createMemeList (value: string) {
  return await Promise.all(
    (await utils.get_meme_all_keywords() ?? []).map(async keyword => {
      const memeKey = await utils.get_meme_key_by_keyword(keyword)
      return components.checkbox.create(value, {
        label: keyword,
        value: memeKey ?? ''
      })
    })
  )
}

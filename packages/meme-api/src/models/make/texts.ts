import { Message } from 'node-karin'

import { Config } from '@/common'
import { utils } from '@/models'

export async function handleTexts(
  e: Message,
  memekey: string,
  min_texts: number,
  max_texts: number,
  allUsers: string[],
  quotedUser: string | null,
  userText: string,
  formdata: Record<string, unknown> | FormData,
  isRust: boolean,
): Promise<
  { success: true; texts: string } | { success: false; message: string }
> {
  let texts: string[] = []

  /** 用户输入的文本 */
  if (userText) {
    const splitTexts = userText.split('/').map((text) => text.trim())
    for (const text of splitTexts) {
      if (text) {
        texts.push(text)
      }
    }
  }
  if (texts.length === 0) {
    const memeInfo = await utils.get_meme_info(memekey)
    if (!isRust) {
      if (Config.meme.username) {
        texts.push(
          await utils.getUserAame(e, quotedUser ?? allUsers[0] ?? e.userId),
        )
      } else {
        const default_texts = memeInfo?.default_texts
          ? JSON.parse(String(memeInfo.default_texts))
          : null
        while (texts.length < min_texts) {
          const randomIndex = Math.floor(Math.random() * default_texts.length)
          texts.push(default_texts[randomIndex])
        }
      }
    }
  }

  texts = texts.slice(0, max_texts)

  if (isRust) {
    ;(formdata as Record<string, unknown>)['texts'] = texts
  } else {
    texts.forEach((text) => {
      ;(formdata as FormData).append('texts', text)
    })
  }

  return texts.length < min_texts
    ? {
        success: false,
        message:
          min_texts === max_texts
            ? `该表情需要${min_texts}个文本`
            : `该表情至少需要 ${min_texts} ~ ${max_texts} 个文本`,
      }
    : {
        success: true,
        texts: userText,
      }
}

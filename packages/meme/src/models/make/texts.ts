import { Message } from 'node-karin'

export async function handleTexts (
  _e: Message,
  min_texts: number,
  max_texts: number,
  userText:string,
  formdata: Record<string, unknown>,
): Promise<
  | { success: true, texts: string }
  | { success: false, message: string }
> {
  let texts: Array<string> = []

  /** 用户输入的文本 */
  if (userText) {
    const splitTexts = userText.split('/').map((text) => text.trim())
    for (const text of splitTexts) {
      if (text) {
        texts.push(text)
      }
    }
  }

  texts = texts.slice(0, max_texts);

  (formdata as Record<string, unknown>)['texts'] = texts


  return texts.length < min_texts
    ? {
        success: false,
        message: min_texts === max_texts
          ? `该表情需要${min_texts}个文本`
          : `该表情至少需要 ${min_texts} ~ ${max_texts} 个文本`
      }
    : {
        success: true,
        texts: userText
      }
}

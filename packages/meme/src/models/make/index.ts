import { base64, logger, Message } from 'node-karin'

import { Config } from '@/common'
import { db, utils } from '@/models'
import { handleImages } from '@/models/make/images'
import { handleOption } from '@/models/make/options'
import { handleTexts } from '@/models/make/texts'
import type { MemeOptionType } from '@/types'

/**
 * 生成表情包图片
 * @param e - 消息对象，包含消息内容和上下文信息
 * @param memekey - 表情包模板的唯一标识key
 * @param min_texts - 最少需要处理的文本数量
 * @param max_texts - 最多可以处理的文本数量
 * @param min_images - 最少需要处理的图片数量
 * @param max_images - 最多可以处理的图片数量
 * @param options - 表情包的可选配置项数组，可为null
 * @param userText - 用户输入的原始文本
 * @param isRust - 是否使用Rust后端处理
 * @param isPreset - [可选] 是否为预设模板
 * @param PresetKeyWord - [可选] 预设模板的关键字
 * @returns 返回处理完成的表情包图片base64数据，格式为"base64://xxxx"
 */
export async function make_meme (
  e: Message,
  memekey: string,
  min_texts: number,
  max_texts: number,
  min_images:number,
  max_images: number,
  options: MemeOptionType[] | null,
  userText: string,
  isPreset?: boolean,
  PresetKeyWord?: string
): Promise<string> {
  try {
    const getquotedUser = async (e: Message): Promise<string | null> => {
      let source = null
      const replyId: string | null = e.replyId ?? e.elements.find((m) => m.type === 'reply')?.messageId ?? null

      if (replyId) {
        source = (await e.bot.getMsg(e.contact, replyId)) ?? null
      }
      if (source) {
        return source.sender.userId.toString()
      }
      return null
    }

    const quotedUser = await getquotedUser(e)
    const allUsers = [
      ...new Set([
        ...e.elements
          .filter(m => m?.type === 'at')
          .map(at => at?.targetId?.toString() ?? ''),
        ...[...(userText?.matchAll(/@\s*(\d+)/g) ?? [])].map(match => match[1] ?? '')
      ])
    ].filter(targetId => targetId && targetId !== quotedUser)
    let formdata: Record<string, unknown> = {
      images: [],
      texts: [],
      options: {}
    }
    if (options) {
      const option = await handleOption(e, memekey, userText, allUsers, formdata, isPreset, PresetKeyWord)
      if (!option.success) {
        throw new Error(option.message)
      }
      userText = option.text
    }
    if (min_texts >= 0 && max_texts > 0) {
      const text = await handleTexts(e, min_texts, max_texts, userText, formdata)
      if (!text.success) {
        throw new Error(text.message)
      }
    }

    if (min_images >= 0 && max_images > 0) {
      const image = await handleImages(e, memekey, min_images, max_images, allUsers, quotedUser, userText, formdata)
      if (!image.success) {
        throw new Error(image.message)
      }
    }
    logger.debug(`生成的表情的key: ${memekey}`)
    logger.debug(
      `表情的参数:\n${
 `images: ${JSON.stringify(
              (formdata as { images: Array<{ id: string; name: string }> }).images
                .map(img => ({ id: img.id, name: img.name }))
            )}\n` +
            `texts: ${JSON.stringify((formdata as { texts: unknown[] }).texts)}\n` +
            `options: ${JSON.stringify((formdata as { options: Record<string, unknown> }).options)}`
          }`
    )
    const response = await utils.make_meme(memekey, formdata)
    const basedata = await base64(response)
    if (Config.stat.enable && e.isGroup) {
      const groupStart = (await db.stat.get({
        groupId: e.groupId,
        memeKey: memekey
      }))?.count ?? 0
      await db.stat.add({
        groupId: e.groupId,
        memeKey: memekey,
        count: Number(groupStart) + 1
      })
    }
    return `base64://${basedata}`
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

import karin, { logger, Message, segment } from 'node-karin'

import { Config } from '@/common'
import { make, utils } from '@/models'
import { Version } from '@/root'

let memeRegExp: RegExp | null, presetRegExp: RegExp | null


/**
 * 生成正则
 */
const createRegex = async (getKeywords: () => Promise<string[]>): Promise<RegExp | null> => {
  const keywords = (await getKeywords()) ?? []
  if (keywords.length === 0) return null
  const prefix = Config.meme.forceSharp ? '^#' : '^#?'
  const escapedKeywords = keywords
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
  const keywordsRegex = `(${escapedKeywords.join('|')})(?=\\s|$)`
  return new RegExp(`${prefix}${keywordsRegex}(.*)`, 'i')
}

memeRegExp = await createRegex(async () => await utils.get_meme_all_keywords() ?? [])
presetRegExp = await createRegex(async () => await utils.get_preset_all_keywords() ?? [])

/**
 * 更新正则
 */
export const updateRegExp = async () => {
  memeRegExp = await createRegex(async () => await utils.get_meme_all_keywords() ?? [])
  presetRegExp = await createRegex(async () => await utils.get_preset_all_keywords() ?? [])
  if (preset && presetRegExp) preset.reg = presetRegExp
  if (meme && memeRegExp) meme.reg = memeRegExp
}
/**
 * 权限检查
 * @param e 消息
 * @returns 是否有权限
 */
const checkUserAccess = (e: Message): boolean => {
  if (!Config.access.enable) return true

  const userId = e.userId

  if (e.isGroup) {
    const groupId = e.groupId
    const groupConfig = Config.access.accessList.find(item => item.groupId.toString() === groupId)

    if (groupConfig) {
      if (Config.access.accessMode === 0) {
        /** 白名单模式 */
        if (!groupConfig.whiteUser.map(String).includes(userId)) {
          logger.info(`[${Version.Plugin_AliasName}] 用户 ${userId} 不在群 ${groupId} 的白名单中，跳过生成`)
          return false
        }
      } else {
        /**  黑名单模式 */
        console.log(groupConfig.blackUser)
        if (groupConfig.blackUser.map(String).includes(userId)) {
          logger.info(`[${Version.Plugin_AliasName}] 用户 ${userId} 在群 ${groupId} 的黑名单中，跳过生成`)
          return false
        }
      }
      return true
    }
  }

  /** 全局模式 */
  const globalConfig = Config.access.accessList.find(item => item.groupId.toString() === 'global')
  if (globalConfig) {
    if (Config.access.accessMode === 0) {
      /** 白名单模式 */
      if (!globalConfig.whiteUser.map(String).includes(userId)) {
        logger.info(`[${Version.Plugin_AliasName}] 用户 ${userId} 不在全局白名单中，跳过生成`)
        return false
      }
    } else {
      /**  黑名单模式 */
      if (globalConfig.blackUser.map(String).includes(userId)) {
        logger.info(`[${Version.Plugin_AliasName}] 用户 ${userId} 在全局黑名单中，跳过生成`)
        return false
      }
    }
  }
  return true
}

/**
 * 表情权限检查
 * @param e 消息
 * @param key 表情键值
 * @returns 是否有权限使用该表情
 */
const checkMemeAccess = async (e: Message, key: string): Promise<boolean> => {
  if (!Config.access.memeEnable) return true

  /**
 * 获取名单中表情的键值
 * @param memeList 表情名单
 * @returns 键值数组
 */
  const getMemeKeys = async (memeList: string[]): Promise<string[]> => {
    const keyPromises = memeList.map(async item =>
      await utils.get_meme_key_by_keyword(item) ?? item
    )
    return await Promise.all(keyPromises)
  }

  if (e.isGroup) {
    const groupId = e.groupId
    const groupConfig = Config.access.memeAccessList.find(item => item.groupId.toString() === groupId)

    if (groupConfig) {
      if (Config.access.memeMode === 0) {
        /** 白名单模式 */
        const whiteKeys = await getMemeKeys(groupConfig.whiteMeme)
        if (!whiteKeys.includes(key)) {
          logger.info(`[${Version.Plugin_AliasName}] 表情 "${key}" 不在群 ${groupId} 的白名单中，跳过生成`)
          return false
        }
      } else {
        /**  黑名单模式 */
        const blackKeys = await getMemeKeys(groupConfig.blackMeme)
        if (blackKeys.includes(key)) {
          logger.info(`[${Version.Plugin_AliasName}] 表情 "${key}" 在群 ${groupId} 的黑名单中，跳过生成`)
          return false
        }
      }
      return true
    }
  }

  const globalConfig = Config.access.memeAccessList.find(item => item.groupId.toString() === 'global')

  if (globalConfig) {
    if (Config.access.memeMode === 0) {
      /** 白名单模式 */
      const whiteKeys = await getMemeKeys(globalConfig.whiteMeme)
      if (!whiteKeys.includes(key)) {
        logger.info(`[${Version.Plugin_AliasName}] 表情 "${key}" 不在全局白名单中，跳过生成`)
        return false
      }
    } else {
      /**  黑名单模式 */
      const blackKeys = await getMemeKeys(globalConfig.blackMeme)
      if (blackKeys.includes(key)) {
        logger.info(`[${Version.Plugin_AliasName}] 表情 "${key}" 在全局黑名单中，跳过生成`)
        return false
      }
    }
  }

  return true
}

/**
 * 防误触发处理
 */
const checkUserText = (min_texts: number, max_texts: number, userText: string): boolean => {
  if (min_texts === 0 && max_texts === 0 && userText) {
    const trimmedText = userText.trim()
    if (
      !/^(@\s*\d+\s*)+$/.test(trimmedText) &&
      !/^(#\S+\s+[^#]+(?:\s+#\S+\s+[^#]+)*)$/.test(trimmedText)
    ) {
      return false
    }
  }
  return true
}

export const meme = memeRegExp && karin.command(memeRegExp, async (e: Message) => {
  if (!Config.meme.enable) return false
  try {
    const [, keyword, userText] = e.msg.match(meme!.reg)!
    const key = await utils.get_meme_key_by_keyword(keyword)
    if (!key) return false
    const memeInfo = await utils.get_meme_info(key)
    const min_texts = memeInfo?.min_texts ?? 0
    const max_texts = memeInfo?.max_texts ?? 0
    const min_images = memeInfo?.min_images ?? 0
    const max_images = memeInfo?.max_images ?? 0
    const options = memeInfo?.options ?? null
    /* 检查用户权限 */
    if (!checkUserAccess(e)) return false

    /* 检查表情权限 */
    if (!await checkMemeAccess(e, key)) return false

    /* 防误触发处理 */
    if (!checkUserText(min_texts, max_texts, userText)) return false


    const res = await make.make_meme(
      e,
      key,
      min_texts,
      max_texts,
      min_images,
      max_images,
      options,
      userText,
      false
    )
    await e.reply([segment.image(res)], { reply: Config.meme.reply })
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]: 生成表情失败, 错误信息: ${(error as Error).message}`)
    return true
  }
}, {
  name: '柠糖表情:表情合成',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})

export const preset = presetRegExp && karin.command(presetRegExp, async (e: Message) => {
  if (!Config.meme.enable) return false
  try {
    const [, keyword, userText] = e.msg.match(preset!.reg)!
    const key = await utils.get_preset_key(keyword)
    if (!key) return false
    const memeInfo = await utils.get_meme_info(key)
    const min_texts = memeInfo?.min_texts ?? 0
    const max_texts = memeInfo?.max_texts ?? 0
    const min_images = memeInfo?.min_images ?? 0
    const max_images = memeInfo?.max_images ?? 0
    const options = memeInfo?.options ?? null
    /* 检查用户权限 */
    if (!checkUserAccess(e)) return false

    /* 检查表情权限 */
    if (!await checkMemeAccess(e, key)) return false

    /* 防误触发处理 */
    if (!checkUserText(min_texts, max_texts, userText)) return false

    const res = await make.make_meme(
      e,
      key,
      min_texts,
      max_texts,
      min_images,
      max_images,
      options,
      userText,
      true,
      keyword
    )
    await e.reply([segment.image(res)], { reply: Config.meme.reply })
  } catch (error) {
    logger.error(error)
    await e.reply(`[${Version.Plugin_AliasName}]: 生成表情失败, 错误信息: ${(error as Error).message}`)
    return true
  }
}, {
  name: '柠糖表情:预设表情合成',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})

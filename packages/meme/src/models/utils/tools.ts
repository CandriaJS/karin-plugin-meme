import { db } from '@/models'
import type { dbType, MemeInfoType, MemeOptionType } from '@/types'
import { getMemes, MemeOption } from 'meme-generator'
import { logger } from 'node-karin'
import { preset } from './preset'
type Model = dbType['meme']
type PresetModel = dbType['preset']


export async function init() {
  await update_meme()
  await update_preset()
}

export async function update_meme(force: boolean = false) {
  try {
    const keys = await get_meme_all_keys()
    if (keys && keys.length > 0 && !force) return
    const memesInfos = getMemes()
    const memeData = memesInfos.map(meme => {
      const info = meme.info
      const options = info.params.options
      const MemeOptions = options.map((option: MemeOption) => ({
        type: option.type.toLowerCase() as MemeOptionType['type'],
        name: option.field0.name,
        default: option.field0.default ?? null,
        description: option.field0.description ?? null,
        choices: 'choices' in option.field0 ? option.field0.choices ?? null : null,
        minimum: 'minimum' in option.field0 ? option.field0.minimum ?? null : null,
        maximum: 'maximum' in option.field0 ? option.field0.maximum ?? null : null
      }))

      return {
        key: info.key,
        keyWords: info.keywords,
        min_texts: info.params.minTexts,
        max_texts: info.params.maxTexts,
        min_images: info.params.minImages,
        max_images: info.params.maxImages,
        default_texts: info.params.defaultTexts ?? null,
        options: options?.length ? MemeOptions : null,
        tags: Array.from(info.tags ?? [])
      }
    })
    if (memeData && memeData.length > 0) {
      await add_meme(memeData, {
        type: 'bulk',
        force
      })
    }
  } catch (error) {
    logger.error('更新表情包信息失败', error)
  }
}

export async function update_preset(force: boolean = false) {
  try {
    const presetKeys = await get_preset_all_keys()
    if (presetKeys && presetKeys.length > 0 && !force) return
    await Promise.all(
      preset.map(async (preset) => {
        const memeExists = await db.meme.get(preset.key)
        if (!memeExists && !force) return
        await db.preset.add({
          name: preset.name,
          key: preset.key,
          option_name: preset.option_name,
          option_value: preset.option_value
        }, {
          force
        })
      })
    )
  } catch (error) {
    logger.error(`初始化预设数据失败: ${error}`)
  }
}

/**
 * 添加表情
 * @param meme 表情数据
 * - key 表情的唯一标识符
 * - keyWords 表情的关键词列表
 * - min_texts 表情最少的文本数
 * - max_texts 表情最多的文本数
 * - min_images 表情最少的图片数
 * - max_images 表情最多的图片数
 * - default_texts 表情的默认文本列表
 * - options 表情的参数类型
 * - tags 表情的标签列表
 * @param type 操作类型
 * - common: 普通写入 (默认)
 * - bulk: 批量写入
 * @returns 添加结果
 */
export async function add_meme(
  meme: Array<{
    key: MemeInfoType['key'],
    keyWords: MemeInfoType['keywords'],
    min_texts: MemeInfoType['params']['min_texts'],
    max_texts: MemeInfoType['params']['max_texts'],
    min_images: MemeInfoType['params']['min_images'],
    max_images: MemeInfoType['params']['max_images'],
    default_texts: MemeInfoType['params']['default_texts'],
    options: MemeInfoType['params']['options'],
    tags: MemeInfoType['tags']
  }>,
  options?: {
    type?: 'common' | 'bulk',
    force?: boolean
  }
): Promise<[Model, boolean | null] | Model[]> {
  if (meme.length === 0) return []
  const { type = 'common', force = false } = options ?? {}

  if (type === 'bulk') {
    meme = Array.isArray(meme) ? meme : [meme]
    const dataList = meme.map(item => ({
      key: item.key,
      keyWords: item.keyWords,
      min_texts: item.min_texts,
      max_texts: item.max_texts,
      min_images: item.min_images,
      max_images: item.max_images,
      default_texts: item.default_texts,
      options: item.options,
      tags: item.tags
    }))
    return await db.meme.add_bulk(dataList, { force })
  } else {
    const singleMeme = Array.isArray(meme) ? meme[0] : meme
    const data = {
      key: singleMeme.key,
      keyWords: singleMeme.keyWords,
      min_texts: singleMeme.min_texts,
      max_texts: singleMeme.max_texts,
      min_images: singleMeme.min_images,
      max_images: singleMeme.max_images,
      default_texts: singleMeme.default_texts,
      options: singleMeme.options,
      tags: singleMeme.tags
    }
    return await db.meme.add(data, { force })
  }
}

/**
 * 获取所有预设的键值信息
 * @returns 键值信息列表
 */
export async function get_preset_all_keys(): Promise<string[] | null> {
  const res = await db.preset.getAll()
  return res.map(preset => preset.key).flat() ?? null
}

/**
 * 获取所有预设表情的关键词信息
 * @returns 关键词信息列表
 */
export async function get_preset_all_keywords(): Promise<string[] | null> {
  const res = await db.preset.getAll()
  return res.map(preset => preset.name).flat() ?? null
}

/**
 * 通过关键词获取预设表情的键值
 * @param keyword 关键词
 * @returns 键值
 */
export async function get_preset_key(keyword: string): Promise<string | null> {
  const res = await get_preset_info_by_keyword(keyword)
  if (!res) return null
  return res.key
}

/**
 * 通过表情的键值获取预设表情的关键词
 * @param key 表情的唯一标识符
 * @returns 预设表情信息
 */
export async function get_preset_keyword(key: string): Promise<string[] | null> {
  const res = await db.preset.getAll()
  const filteredOptions = res
    .filter(preset => preset.key === key)
    .map(preset => preset.name)
  return filteredOptions.length > 0 ? filteredOptions : null
}

/**
 * 获取指定的预设表情信息
 * @param key 表情的唯一标识符
 * @returns 预设表情信息
 */
export async function get_preset_info(key: string): Promise<PresetModel | null> {
  return await db.preset.get(key)
}

/**
 * 通过关键词获取预设表情信息
 * @param keyword 表情关键词
 * @returns 预设表情信息
 */
export async function get_preset_info_by_keyword(keyword: string): Promise<PresetModel | null> {
  return await db.preset.getByKeyWord(keyword)
}

/**
 * 获取所有相关预设表情的键值
 * @param keyword 表情的关键词
 * @returns 所有相关预设表情的键值列表
 */
export async function get_preset_all_about_keywords(keyword: string): Promise<string[] | null> {
  const res = await db.preset.getByKeyWordAbout(keyword)
  return res.map(preset => preset.name).flat() ?? null
}

/**
 * 获取所有相关预设表情的关键词
 * @param key 表情的唯一标识符
 * @returns 所有相关预设表情的键值列表
 */
export async function get_preset_all_about_keywords_by_key(key: string): Promise<string[] | null> {
  const res = await db.preset.getAbout(key)
  return res.map(preset => preset.name).flat() ?? null
}

/**
 * 获取所有表情的键值信息
 * @returns 键值信息列表
 */
export async function get_meme_all_keys(): Promise<string[] | null> {
  const res = await db.meme.getAll()
  return res.map(meme => meme.key).flat() ?? null
}

/**
 * 通过关键词获取表情键值
 * @param keyword 表情关键词
 * @returns 表情键值
 */
export async function get_meme_key_by_keyword(keyword: string): Promise<string | null> {
  const res = await get_meme_info_by_keyword(keyword)
  if (!res) return null
  return res.key
}

/**
 * 通过键值获取表情的标签信息
 * @param tag 表情的tag
 * @returns 表情的标签信息
 */
export async function get_meme_key_by_tag(tag: string): Promise<string[] | null> {
  const res = await db.meme.getByTag(tag)
  if (!res) return null
  return JSON.parse(String(res.key))
}

/**
 * 获取所有所有相关表情的键值
 * @param key 表情的唯一标识符
 * @returns 所有相关表情的键值列表
 */
export async function get_meme_keys_by_about(key: string): Promise<string[] | null> {
  const res = await db.meme.getKeysByAbout(key)
  return res.map(meme => meme.key).flat() ?? null
}

/**
 * 获取所有所有相关表情的键值
 * @param tag 表情的标签
 * @returns 所有相关表情的键值列表
 */
export async function get_meme_keys_by_about_tag(tag: string): Promise<string[] | null> {
  const res = await db.meme.getTagsByAbout(tag)
  return res.map(meme => meme.key).flat() ?? null
}
/**
 * 获取所有表情的关键词信息
 * @returns 关键词信息列表
 */
export async function get_meme_all_keywords(): Promise<string[] | null> {
  const res = await db.meme.getAll()
  return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
}

/**
 * 获取所有表情的标签信息
 * @returns 标签信息列表
 */
export async function get_meme_all_tags(): Promise<string[] | null> {
  const res = await db.meme.getAll()
  return res.map((item) => JSON.parse(String(item.tags))).flat() ?? null
}

/**
 * 通过键值获取表情的关键词信息
 * @param key 表情的唯一标识符
 * @returns 表情的关键词信息
 */
export async function get_meme_keyword(key: string): Promise<string[] | null> {
  const res = await get_meme_info(key)
  if (!res) return null
  return JSON.parse(String(res.keyWords))
}

/**
 * 通过关键词获取表情的标签信息
 * @param tag 表情的标签
 * @returns 表情的标签信息
 */
export async function get_meme_keyword_by_tag(tag: string): Promise<string[] | null> {
  const res = await db.meme.getByTag(tag)
  if (!res) return null
  return JSON.parse(String(res.keyWords))
}

/**
 * 获取所有相关表情的关键词信息
 * @param keyword 表情关键词
 * @returns 所有相关表情的关键词列表
 */
export async function get_meme_keywords_by_about(keyword: string): Promise<string[] | null> {
  const res = await db.meme.getKeyWordsByAbout(keyword)
  return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
}
/**
 * 获取所有相关表情的关键词信息
 * @param tag 表情的标签
 * @returns 所有相关表情的关键词列表
 */
export async function get_meme_keywords_by_about_tag(tag: string): Promise<string[] | null> {
  const res = await db.meme.getTagsByAbout(tag)
  return res.map((item) => JSON.parse(String(item.keyWords))).flat() ?? null
}

/**
 * 获取表情信息
 * @param key 表情唯一标识符
 * @returns 表情信息
 */
export async function get_meme_info(key: string): Promise<Model | null> {
  return await db.meme.get(key) ?? null
}

/**
 * 通过关键词获取表情信息
 * @param keyword 表情关键词
 * @returns 表情信息
 */
export async function get_meme_info_by_keyword(keyword: string): Promise<Model | null> {
  return await db.meme.getByKeyWord(keyword) ?? null
}
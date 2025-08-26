import karin, { logger } from 'node-karin'

import { db, imageTool, server, utils } from '@/models'
import Request from '@/models/utils/request'
import type { dbType, MemeInfoType, MemeOptionType } from '@/types'
import { parallel, tryit } from 'radashi'

type Model = dbType['meme']
type PresetModel = dbType['preset']

/** 初始化数据 */
export async function init() {
  await update_meme()
  await update_preset()
}

/**
 * 更新表情数据
 * @param force 是否强制更新
 * @returns 初始化结果
 */
export async function update_meme(force: boolean = false) {
  try {
    const keys = await get_meme_all_keys()
    if (keys && keys.length > 0 && !force) return
    const url = await utils.get_base_url()
    const isRustServer = await utils.isRustServer()
    let memeDataList
    if (isRustServer) {
      const res = await Request.get(`${url}/meme/infos`)
      if (!res.success) throw new Error(res.msg)
      if (res.data && Array.isArray(res.data)) {
        memeDataList = res.data.map(meme => {
          const {
            key,
            keywords: keyWords,
            params: {
              min_texts,
              max_texts,
              min_images,
              max_images,
              default_texts,
              options
            },
            tags
          } = meme

          const MemeOptions = options.map((option: MemeOptionType) => ({
            type: option.type,
            name: option.name,
            default: option.default,
            description: option.description ?? null,
            choices: option.choices ?? null,
            minimum: option.minimum ?? null
          }))

          return {
            key,
            keyWords: keyWords?.length ? keyWords : null,
            min_texts,
            max_texts,
            min_images,
            max_images,
            default_texts: default_texts?.length ? default_texts : null,
            options: options?.length ? MemeOptions : null,
            tags: tags?.length ? tags : null
          }
        })
      }
    } else {
      const keysRes = await Request.get(`${url}/memes/keys`)
      if (!keysRes.success) throw new Error(keysRes.msg)
      const concurrentLimit = 20
      const [errors, memeInfos] = await tryit(() =>
        parallel(
          concurrentLimit,
          keysRes.data,
          async (key: string) => {
            const [err, infoRes] = await tryit(() => Request.get(`${url}/memes/${key}/info`))();
            if (err) {
              logger.warn(`获取表情信息失败: ${key}, 错误: ${err.message}`);
              return null;
            }
            return infoRes.success ? infoRes.data : null;
          }
        )
      )();

      if (errors) {
        logger.error(`获取所有表情数据失败: ${errors.message}`);
        throw new Error(`获取所有表情数据失败: ${errors}`)
      }


      memeDataList = memeInfos.filter(Boolean).map(meme => {
        const MemeOptions = meme.params_type?.args_type
          ? Object.entries(meme.params_type.args_type.args_model.properties)
            .filter(([name]) => name !== 'user_infos')
            .map(([name, prop]: [string, any]) => {
              const option: MemeOptionType = {
                type: convertSchemaTypeToOptionType(prop.type),
                name,
                default: prop.default,
                description: prop.description ?? null,
                choices: null,
                minimum: null,
                maximum: null
              }
              return option
            })
          : null

        return {
          key: meme.key,
          keyWords: meme.keywords,
          min_texts: meme.params_type?.min_texts,
          max_texts: meme.params_type?.max_texts,
          min_images: meme.params_type?.min_images,
          max_images: meme.params_type?.max_images,
          default_texts: meme.params_type?.default_texts,
          options: meme.params_type?.args_type ? MemeOptions : null,
          tags: meme.tags?.length ? meme.tags : null
        }
      })
    }
    if (memeDataList && memeDataList.length > 0) {
      await add_meme(memeDataList, {
        type: 'bulk',
        force
      })
    } else {
      logger.warn('未获取到有效的表情数据')
    }
  } catch (error) {
    logger.error(`初始化表情数据失败: ${error}`)
  }
}

/**
 * 更新预设数据
 * @param force 是否强制更新
 * @returns 初始化结果
 */
export async function update_preset(force: boolean = false) {
  try {
    const presetKeys = await get_preset_all_keys()
    if (presetKeys && presetKeys.length > 0 && !force) return
    const isRustServer = await utils.isRustServer()
    let preset
    if (isRustServer) {
      preset = (await import('@/models/utils/preset-rs')).preset_rs
    } else {
      preset = (await import('@/models/utils/preset-py')).preset_py
    }
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

function convertSchemaTypeToOptionType(schemaType: string | string[]): MemeOptionType['type'] {
  if (Array.isArray(schemaType)) {
    schemaType = schemaType.find(t => t !== 'null') ?? 'string'
  }
  switch (schemaType) {
    case 'boolean':
      return 'boolean'
    case 'integer':
      return 'integer'
    case 'number':
      return 'float'
    default:
      return 'string'
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

type UploadImage<T extends 'url' | 'path' | 'data'> = {
  image: Buffer | string;
  type: T;
} & (T extends 'url' ? { headers?: Record<string, string> } : {});


/**
 * 上传图片
 * @param image 图片数据
 * @param type 上传的图片类型
 * - url 图片的网络地址
 * - path 图片的本地路径
 * - data 图片的base64数据
 * @param headers  请求头，仅在type为url时生效
 * @returns image_id 图片的唯一标识符
 */
export async function upload_image<T extends 'url' | 'path' | 'data'>(
  options: UploadImage<T>
): Promise<string> {
  try {
    const { image, type } = options;
    let data;

    if (type === 'url') {
            const { headers } = options as UploadImage<'url'>;
      data = {
        type: 'url',
        url: image,
        ...(headers && { headers }),
      };
    } else if (type === 'path') {
      data = {
        type: 'path',
        path: image,
      };
    } else if (type === 'data') {
      data = {
        type: 'data',
        data: Buffer.isBuffer(image) ? image.toString('base64') : image,
      };
    } else {
      throw new Error('无效的图片类型');
    }

    const url = await utils.get_base_url();
    const res = await Request.post(`${url}/image/upload`, data, {}, 'json');
    if (!res.success) throw new Error('图片上传失败');
    return res.data.image_id;
  } catch (error) {
    logger.error(error);
    throw new Error((error as Error).message);
  }
}
/**
 * 获取表情预览地址
 * @param key 表情唯一标识符
 * @returns 表情数据
 */
export async function get_meme_preview(key: string): Promise<Buffer> {
  try {
    const meme_server_type = await server.get_meme_server_type()
    const url = await utils.get_base_url()
    let image
    if (meme_server_type === 'rust') {
      const res = await Request.get(`${url}/memes/${key}/preview`)
      if (!res.success) throw new Error(res.msg)
      image = await imageTool.get_image(res.data.image_id, 'buffer')
    } else if (meme_server_type === 'python') {
      const res = await Request.get(`${url}/memes/${key}/preview`, {}, {}, 'arraybuffer')
      if (!res.success) throw new Error(res.msg)
      image = res.data
    } else {
      throw new Error('未知的meme-generator服务器类型, 不支持生成预览图片')
    }
    return image as Buffer
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

/**
 * 生成表情图片
 * @param memekey 表情唯一标识符
 * @param data 表情数据
 * @returns 表情图片数据
 */
export async function make_meme(memekey: string, data: Record<string, unknown> | FormData, type?: 'python' | 'rust'): Promise<Buffer> {
  try {
    const meme_server_type = type ?? await server.get_meme_server_type()
    const url = await utils.get_base_url()
    let res, image
    if (meme_server_type === 'python') {
      res = await Request.post(`${url}/memes/${memekey}/`, data, {}, 'arraybuffer')
      if (!res.success) throw new Error(res.msg)
      image = res.data
    } else if (meme_server_type === 'rust') {
      res = await Request.post(`${url}/memes/${memekey}`, data, {}, 'json')
      if (!res.success) throw new Error(res.msg)
      image = await imageTool.get_image(res.data.image_id, 'buffer')
      if (!image) throw new Error('获取图片失败')
    } else {
      throw new Error('未知的meme-generator服务器类型, 不支持生成')
    }
    return image as Buffer
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

/**
 * 向指定的群或好友发送文件
 * @param type 发送的类型
 * - group 为群
 * - private 为好友
 * @param botId 机器人的id
 * @param id 群或好友的id
 * @param file 文件路径
 * @param name 文件名称
 * @returns 发送结果
 */
export async function send_file(type: 'group' | 'private', botId: number, id: number, file: string, name: string) {
  try {
    const bot = karin.getBot(String(botId))
    let Contact
    if (type === 'group') {
      Contact = karin.contactGroup(String(id))
    } else if (type === 'private') {
      Contact = karin.contactFriend(String(id))
    } else {
      throw new Error('type 必须为 group 或 private')
    }
    return await bot?.uploadFile(Contact, file, name)
  } catch (error) {
    throw new Error(`向${type === 'group' ? '群' : '好友'} ${id} 发送文件失败: ${(error as Error).message}`)
  }
}

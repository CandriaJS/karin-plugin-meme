import { base64 } from 'node-karin'

import { utils } from '@/models'

/**
 * 获取图片
 * @param image_id 图片 ID
 * @param type 返回类型 base64 或 buffer  默认 base64
 * @returns 图片
 */
export const get_image = async (image_id: string, type: 'base64' | 'buffer' = 'base64'): Promise<Buffer | string> => {
  try {
    const url = await utils.get_base_url()
    const res = await utils.Request.get(`${url}/image/${image_id}`, {}, {}, 'arraybuffer')
    switch (type) {
      case 'buffer':
        return res.data
      case 'base64':
      default:
        return await base64(res.data)
    }
  } catch (error) {
    throw new Error(`获取图片失败: ${(error as Error).message}`)
  }
}
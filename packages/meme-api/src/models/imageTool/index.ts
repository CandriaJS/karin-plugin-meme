import { base64 } from 'node-karin'

import { utils } from '@/models'

/**
 * 获取图片
 * @param image_id 图片 ID
 * @param type 返回类型 base64 或 buffer  默认 base64
 * @returns 图片
 */
export async function get_image<T extends 'base64' | 'buffer' = 'base64'>(
  image_id: string,
  type?: T,
): Promise<T extends 'buffer' ? Buffer : string> {
  try {
    const url = await utils.getBaseUrl()
    const res = await utils.Request.get(
      `${url}/image/${image_id}`,
      {},
      {},
      'arraybuffer',
    )
    const actualType = type ?? ('base64' as T)
    switch (actualType) {
      case 'buffer':
        return res.data as T extends 'buffer' ? Buffer : string
      case 'base64':
      default:
        return (await base64(res.data)) as T extends 'buffer' ? Buffer : string
    }
  } catch (error) {
    throw new Error(`获取图片失败: ${(error as Error).message}`)
  }
}

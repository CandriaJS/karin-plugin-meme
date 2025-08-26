import { db } from '@/models'
type Model = db.base.Model

export interface statType extends Model {
  /** 群组ID */
  groupId: string
  /** 表情ID */
  memeKey: string
  /** 使用次数 */
  count: number
}

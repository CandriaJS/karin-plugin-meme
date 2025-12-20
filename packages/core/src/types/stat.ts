export interface StatType {
  /** * 表情键值 */
  meme_key: string
  /** 群组ID */
  groupId?: string
  /** 用户ID */
  userId?: string
  /** 使用次数 */
  count: number
  /** 创建时间 */
  created_at: Date,
  /** 修改时间 */
  updated_at: Date
}

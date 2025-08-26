export interface memeType {
  /** 表情开关 */
  enable: boolean
  /** 是否开启强制使用前缀触发 */
  forceSharp: boolean
  /** 是否引用回复 */
  reply: boolean
  /** 是否开启头像缓存 */
  cache: boolean
  /** 是否获取用户昵称 */
  username: boolean
  /** 错误回复 */
  errorReply: boolean
}

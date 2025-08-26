import { accessType } from '@/types/config/access'
import { memeType } from '@/types/config/meme'
import { otherType } from '@/types/config/other'
import { ProtectType } from '@/types/config/protect'
import { statType } from '@/types/config/stat'

export interface ConfigType {
  /** 表情配置文件 */
  meme: memeType
  /** 其他配置文件 */
  other: otherType
  /** 权限配置文件 */
  access: accessType
  /* 保护配置文件 */
  protect: ProtectType
  /** 统计配置文件 */
  stat: statType
}

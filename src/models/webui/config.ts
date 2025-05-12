import { Config } from '@/common'
import type { ConfigType } from '@/types'
export function saveConfig (newConfig: ConfigType) {
  let success = false
  try {
    const currentConfig = Config.All()

    for (const [configKey, entries] of Object.entries(newConfig)) {
      for (const entry of entries) {
        for (let [key, value] of Object.entries(entry)) {
          const originalValue = (currentConfig as Record<string, any>)[configKey]?.[key]
          if (typeof value === 'string' && value.trim() === '') {
            value = ''
          } else if (typeof originalValue === 'number' && typeof value === 'string') {
            const numValue = Number(value)
            if (!isNaN(numValue)) {
              value = numValue
            }
          } else if (typeof originalValue === 'boolean' && typeof value === 'string') {
            value = value === 'true'
          } else if (originalValue === null) {
            value = null
          } else if (typeof originalValue === 'object' && typeof value === 'string') {
            try {
              value = JSON.parse(value)
            } catch {
            }
          }
          Config.Modify(configKey as keyof ConfigType, key, value)
        }
      }
    }

    success = true
  } catch (error) {
    success = false
  }
  return {
    success,
    message: success ? 'ฅ^•ﻌ•^ฅ 喵呜~ 配置保存成功啦~' : '(╥﹏╥) 呜喵... 保存失败了，请检查一下下~'
  }
}

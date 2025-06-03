import { Config } from '@/common'
import type { ConfigType } from '@/types'

export function saveConfig (newConfig: ConfigType) {
  let success = false
  try {
    const currentConfig = Config.All()

    for (const [configKey, entries] of Object.entries(newConfig)) {
      // 如果 entries 是数组
      if (Array.isArray(entries)) {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          // 处理每个对象中的字段
          for (let [key, value] of Object.entries(entry)) {
            // 如果值是数组，直接使用
            if (Array.isArray(value)) {
              Config.Modify(configKey as keyof ConfigType, key, value)
              continue
            }

            const originalValue = (currentConfig as Record<string, any>)[configKey]?.[i]?.[key]

            // 处理空字符串
            if (typeof value === 'string' && value.trim() === '') {
              value = ''
            } else if (typeof value === 'string' && !isNaN(Number(value))) {
              const numValue = Number(value)
              if (!isNaN(numValue)) {
                value = numValue
              }
            } else if (typeof value === 'string' && (value === 'true' || value === 'false')) {
              value = value === 'true'
            } else if (value === null || value === 'null') {
              value = null
            } else if (Array.isArray(originalValue) && value === '[Array]') {
              value = originalValue
            } else if (
              typeof value === 'string' &&
              (typeof originalValue === 'object' || Array.isArray(originalValue))
            ) {
              try {
                value = JSON.parse(value)
              } catch {
                // 解析失败保持原值
                console.warn(`Failed to parse JSON for ${configKey}.${key}`)
                value = originalValue
              }
            }

            Config.Modify(configKey as keyof ConfigType, key, value)
          }
        }
      } else if (typeof entries === 'boolean') {
        Config.Modify(configKey as keyof ConfigType, 'value', entries)
      } else if (typeof entries === 'object') {
        for (let [key, value] of Object.entries(entries)) {
          const originalValue = (currentConfig as Record<string, any>)[configKey]?.[key]
          if (typeof value === 'string' && value.trim() === '') {
            value = ''
          } else if (typeof value === 'string' && !isNaN(Number(value))) {
            value = Number(value)
          } else if (typeof value === 'string' && (value === 'true' || value === 'false')) {
            value = value === 'true'
          } else if (Array.isArray(originalValue) && value === '[Array]') {
            value = originalValue
          }
          Config.Modify(configKey as keyof ConfigType, key, value)
        }
      }
    }

    success = true
  } catch (error) {
    console.error('Config save error:', error)
    success = false
  }

  return {
    success,
    message: success ? 'ฅ^•ﻌ•^ฅ 喵呜~ 配置保存成功啦~' : '(╥﹏╥) 呜喵... 保存失败了，请检查一下下~'
  }
}

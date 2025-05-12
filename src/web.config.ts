import { webui } from '@/models'
import type { ConfigType } from '@/types'

export default {
  info: webui.pluginConfig,

  /** 动态渲染的组件 */
  components: async () => (await webui.components()),

  /** 前端点击保存之后调用的方法 */

  /** 这里简写了一下后面再改 */
  save: (newConfig: ConfigType) => {
    console.log('新配置:', newConfig)
    return webui.saveConfig(newConfig)
  }
}

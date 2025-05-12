import { components } from 'node-karin'

import { Config } from '@/common'

export const memeComponents = () => [
  components.accordion.create('meme', {
    label: '表情设置',
    children: [
      components.accordion.createItem('meme', {
        title: '表情设置',
        subtitle: '用于和表情相关的内容，如设置默认表情等',
        children: [
          components.switch.create('enable', {
            label: '默认表情',
            description: '是否开启设置本插件为默认表情',
            defaultSelected: Config.meme.enable
          }),
          components.switch.create('forceSharp', {
            label: '前缀',
            description: '是否开启前缀, 开启使用强制使用#触发'
          }),
          components.switch.create('cache', {
            label: '表情缓存',
            description: '是否开启表情缓存，开启后表情图片将缓存到本地，减少网络请求次数',
            defaultSelected: Config.meme.cache
          }),
          components.switch.create('errorReply', {
            label: '错误回复',
            description: '是否开启错误回复，开启后会在错误时回复错误信息，关闭后只会在控制台输出错误信息',
            defaultSelected: Config.meme.errorReply
          })
        ]
      })
    ]
  })
]

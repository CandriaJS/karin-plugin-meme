import { components } from 'node-karin'

import { Config } from '@/common'

export const memeComponents = () => [
  components.accordion.create('meme', {
    label: '表情设置',
    children: [
      components.accordion.createItem('webui:meme', {
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
            label: '头像缓存',
            description: '是否开启头像缓存，开启后头像图片将缓存到本地，减少网络请求次数',
            defaultSelected: Config.meme.cache
          }),
          components.switch.create('username', {
            label: '用户昵称',
            description: '是否开启使用用户昵称, 开启后默认文本将使用用户昵称',
            defaultSelected: Config.meme.username
          })
        ]
      })
    ]
  })
]

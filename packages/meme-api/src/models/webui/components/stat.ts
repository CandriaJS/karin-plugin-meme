import { components } from 'node-karin'

import { Config } from '@/common'

export const statComponents = () => [
  components.accordion.create('stat', {
    label: '统计设置',
    children: [
      components.accordion.createItem('webui:stat', {
        title: '统计设置',
        subtitle: '用于和统计相关的内容，如开启统计等',
        children: [
          components.switch.create('enable', {
            label: '统计',
            description: '是否开启统计',
            defaultSelected: Config.stat.enable
          })
        ]
      })
    ]
  })
]

import { components } from 'node-karin'

import { Config } from '@/common'

export const otherComponents = () => [
  components.accordion.create('other', {
    label: '其他设置',
    children: [
      components.accordion.createItem('webui:other', {
        title: '其他设置',
        subtitle: '用于和其他相关的内容，如设置渲染精度等',
        children: [
          components.input.number('renderScale', {
            label: '渲染精度',
            description: '渲染精度，数字越大越清晰，但越耗性能',
            defaultValue: Config.other.renderScale.toString(),
            rules: [
              {
                min: 100,
                max: 200,
                error: '数字应在100-200之间'
              },
              {
                regex: /^\d+$/,
                error: '只能输入数字'
              }
            ]
          })
        ]
      })
    ]
  })
]

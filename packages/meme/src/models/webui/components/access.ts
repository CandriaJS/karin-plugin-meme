import { components } from 'node-karin'

import { Config } from '@/common'

export const accessComponents = () => [
  components.accordion.create('access', {
    label: '名单设置',
    children: [
      components.accordion.createItem('webui:access', {
        title: '名单设置',
        subtitle: '用于设置名单限制，如用户白名单、黑名单，禁用指定表情等',
        children: [
          components.switch.create('enable', {
            label: '名单限制',
            description: '是否名单限制',
            defaultSelected: Config.access.enable
          }),
          components.switch.create('memeEnable', {
            label: '表情限制',
            description: '是否开启禁用表情限制',
            defaultSelected: Config.access.memeEnable
          }),
          components.radio.group('accessMode', {
            label: '名单限制模式',
            description: '名单限制模式',
            defaultValue: Config.access.accessMode.toString(),
            radio: [
              components.radio.create('white', {
                label: '白名单',
                value: '0'
              }),
              components.radio.create('black', {
                label: '黑名单',
                value: '1'
              })
            ]
          }),
          components.radio.group('memeMode', {
            label: '表情限制模式',
            description: '表情限制模式',
            defaultValue: Config.access.memeMode.toString(),
            radio: [
              components.radio.create('white', {
                label: '启用表情',
                value: '0'
              }),
              components.radio.create('black', {
                label: '禁用表情',
                value: '1'
              })
            ]
          })
        ]
      })
    ]
  })
]

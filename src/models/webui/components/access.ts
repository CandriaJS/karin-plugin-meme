import { components } from 'node-karin'

import { Config } from '@/common'
import { webui } from '@/models'

export const accessComponents = async () => [
  components.accordion.create('access', {
    label: '名单设置',
    children: [
      components.accordion.createItem('access', {
        title: '名单设置',
        subtitle: '用于设置名单限制，如用户白名单、黑名单，禁用指定表情等',
        children: [
          components.switch.create('enable', {
            label: '名单限制',
            description: '是否名单限制',
            defaultSelected: Config.access.enable
          }),
          components.switch.create('blackListEnable', {
            label: '禁用表情列表',
            description: '是否开启禁用表情列表',
            defaultSelected: Config.access.blackListEnable
          }),
          components.radio.group('mode', {
            label: '名单限制模式',
            description: '名单限制模式',
            defaultValue: Config.access.mode.toString(),
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
          components.input.group('userWhiteList', {
            label: '用户白名单',
            description: '用户白名单',
            data: Config.access.userWhiteList,
            template: components.input.string('userWhiteList', {
              placeholder: '114514',
              label: '',
              color: 'primary'
            })
          }),
          components.input.group('userBlackList', {
            label: '用户黑名单',
            description: '用户黑名单',
            data: Config.access.userBlackList,
            template: components.input.string('userBlackList', {
              placeholder: '114514',
              label: '',
              color: 'primary'
            })
          }),
          components.checkbox.group('blackList', {
            label: '禁用表情列表',
            description: '选择要禁用的表情',
            defaultValue: Config.access.blackList,
            checkbox: await webui.createMemeList('blackList')
          })
        ]
      })
    ]
  })
]

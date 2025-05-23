import { components } from 'node-karin'

import { Config } from '@/common'
import { webui } from '@/models'

export const protectComponents = async () => [
  components.accordion.create('protect', {
    label: '表情保护设置',
    children: [
      components.accordion.createItem('webui:protect', {
        title: '表情保护设置',
        subtitle: '用于设置表情保护等功能',
        children: [
          components.switch.create('enable', {
            label: '表情保护',
            description: '是否开启表情保护',
            defaultSelected: Config.protect.enable
          }),
          components.switch.create('master', {
            label: '主人保护',
            description: '是否开启主人保护，开启后才会进行主人保护',
            defaultSelected: Config.protect.master
          }),
          components.switch.create('userEnable', {
            label: '用户保护',
            description: '是否开启用户保护，开启后才会进行用户保护',
            defaultSelected: Config.protect.userEnable
          }),
          components.input.group('user', {
            label: '其他用户保护列表',
            description: '其他用户保护列表',
            data: Config.protect.user,
            template: components.input.string('user', {
              placeholder: '114514',
              label: '',
              color: 'primary'
            })
          }),
          components.checkbox.group('list', {
            label: '保护表情列表',
            description: '选择要保护的表情',
            defaultValue: Config.protect.list,
            checkbox: await webui.createMemeList('list')
          })
        ]
      })
    ]
  })
]

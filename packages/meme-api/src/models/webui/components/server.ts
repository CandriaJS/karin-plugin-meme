import { components } from 'node-karin'

import { Config } from '@/common'

export const serverComponents = () => [
  components.accordion.create('server', {
    label: '服务设置',
    children: [
      components.accordion.createItem('webui:server', {
        title: '服务设置',
        subtitle: '用于和服务相关的内容，如设置服务地址等',
        children: [
          components.radio.group('mode', {
            label: '服务模式',
            description: '服务模式',
            defaultValue: Config.server.mode.toString(),
            radio: [
              components.radio.create('0', {
                label: '使用远程服务',
                description: '使用远程服务',
                value: '0'
              }),
              components.radio.create('1', {
                label: '使用本地服务',
                description: '使用本地服务',
                value: '1'
              })
            ]
          }),
          components.input.create('url', {
            label: '服务地址',
            isRequired: false,
            description: '自定义表情服务地址',
            defaultValue: Config.server.url,
            isDisabled: Config.server.mode === 1,
            isReadOnly: Config.server.mode === 1,
            rules: [
              {
                regex: /^https?:\/\/((?:\d{1,3}\.){3}\d{1,3}|\w+\.\w{2,})(:\d{1,5})?\/?$/i,
                error: '请输入有效的URL地址'
              }
            ]
          }),
          components.input.number('port', {
            label: '服务端口',
            description: '服务端口',
            defaultValue: Config.server.port.toString(),
            isDisabled: Config.server.mode === 0,
            isReadOnly: Config.server.mode === 0,
            rules: [
              {
                regex: /^\d{1,5}$/,
                error: '请输入有效的端口号'
              }
            ]
          }),
          components.switch.create('usebase64', {
            label: 'base64上传',
            description: '是否开启使用base64上传图片',
            defaultSelected: Config.server.usebase64,
            isDisabled: Config.server.mode === 0,
            isReadOnly: Config.server.mode === 0
          }),
          components.input.number('timeout', {
            label: '超时时间',
            description: '超时时间，单位为秒',
            defaultValue: Config.server.timeout.toString()
          }),
          components.input.number('retry', {
            label: '重试次数',
            description: '重试次数',
            defaultValue: Config.server.retry.toString()
          }),
          components.input.string('proxy_url', {
            label: '代理地址',
            description: '代理地址，用于下载表情服务端文件',
            defaultValue: Config.server.proxy_url,
            placeholder: '请输入代理地址',
            isRequired: false
          }),
          components.input.string('download_url', {
            label: '下载地址',
            description: '下载地址，用于下载表情服务端资源',
            defaultValue: Config.server.download_url,
            placeholder: '请输入下载地址',
            isRequired: false
          })
        ]
      })
    ]
  })
]

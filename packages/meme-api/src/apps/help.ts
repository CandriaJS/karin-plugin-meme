import karin, { Message, segment } from 'node-karin'
import { Render } from '@/common'
import type { HelpGroup } from '@puniyu/component'
import { Version } from '@/root'
import fs from 'node:fs'

export const help = karin.command(
  /^#?(?:(柠糖)?表情)(?:命令|帮助|菜单|help|说明|功能|指令|使用说明)$/i,
  async (e: Message) => {
    const iconImg = await fs.promises.readFile(
      `${Version.Plugin_Path}/resources/icons/image.svg`,
    )
    const helpList: HelpGroup[] = [
      {
        name: '表情命令',
        list: [
          { name: '#柠糖表情列表', desc: '获取表情列表', icon: iconImg },
          { name: '#柠糖表情统计', desc: '获取表情统计', icon: iconImg },
          { name: '#柠糖表情搜索xx', desc: '搜指定的表情', icon: iconImg },
          { name: '#柠糖表情详情xx', desc: '获取指定表情详情', icon: iconImg },
          { name: '#随机表情', desc: '随机生成一个表情', icon: iconImg },
          {
            name: 'xx',
            desc: '如喜报 xx (参数使用#,多个参数同样使用#, 多段文本使用/, 指定用户头像使用@+qq号)',
            icon: iconImg,
          },
        ],
      },
    ]

    if (e.isMaster) {
      const iconImg = await fs.promises.readFile(
        `${Version.Plugin_Path}/resources/icons/update.svg`,
      )
      helpList.push({
        name: '管理命令，仅主人可用',
        list: [
          { name: '#柠糖表情(插件)更新', desc: '更新插件本体', icon: iconImg },
          {
            name: '#柠糖表情更新表情资源',
            desc: '更新表情资源',
            icon: iconImg,
          },
          {
            name: '#柠糖表情更新表情数据',
            desc: '更新表情数据',
            icon: iconImg,
          },
        ],
      })
    }
    const bg = await fs.promises.readFile(
      `${Version.Plugin_Path}/resources/background.webp`,
    )

    const img = await Render.help({
      title: '柠糖图片操作',
      theme: {
        backgroundImage: bg,
      },
      list: helpList,
    })

    await e.reply(segment.image(`base64://${img.toString('base64')}`))
    return true
  },
  {
    name: '柠糖表情:帮助',
    priority: 500,
    event: 'message',
    permission: 'all',
  },
)

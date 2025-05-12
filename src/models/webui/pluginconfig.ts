import { pkg, Version } from '@/root'
export const pluginConfig = {
  name: Version.Plugin_AliasName,
  description: '一个Karin版的表情包合成插件',
  author: [
    {
      name: pkg.author,
      home: pkg.homepage,
      avatar: 'https://avatars.githubusercontent.com/u/196008293'
    }
  ]
}

import * as component from '@puniyu/component'
import { renderList, renderStat } from '@candriajs/utils'
import { Version } from '@/root'


const Render = {
  async list(data: { name: string; types: string[] }[]) {
    const buf = await renderList(data, {
      backgroundPath: `${Version.Plugin_Path}/resources/background.webp`,
      iconsPath: {
        text: `${Version.Plugin_Path}/resources/icons/text.svg`,
        image: `${Version.Plugin_Path}/resources/icons/image.svg`,
        option: `${Version.Plugin_Path}/resources/icons/option.svg`,
      },
    })
    return buf
  },
  async stat(data: {
    total: number
    memeList: { keywords: string; count: number }[]
  }) {
    const buf = await renderStat(data, {
      backgroundPath: `${Version.Plugin_Path}/resources/background.webp`,
    })
    return buf
  },
  help: component.help,
}

export { Render }

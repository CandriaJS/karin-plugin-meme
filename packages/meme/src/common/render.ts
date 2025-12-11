import path from 'node:path'

import karin, { ImageElement, segment } from 'node-karin'
import * as component from '@puniyu/component'
import { renderList, renderStat } from '@candriajs/utils'
import { Config } from '@/common/config'
import { Version } from '@/root'

/**
 * 渲染精度
 * @param {string} pct 缩放百分比
 */
function scale(pct = 1) {
  const renderScale = Config.other.renderScale || 100
  const scale = Math.min(2, Math.max(0.5, renderScale / 100))
  pct = pct * scale
  return `style=transform:scale(${pct})`
}

/**
 * 渲染
 * @param name 文件名称 不包含 `.html`
 * @param params 渲染参数
 */
const Render = {
  async render(name: string, params: Record<string, any> = {}) {
    name = name.replace(/.html$/, '')
    const root = `${Version.Plugin_Path}/resources`
    const img = await karin.render({
      type: 'jpeg',
      encoding: 'base64',
      name: path.basename(name),
      file: `${root}/${name}.html`,
      data: {
        _res_path: `${Version.Plugin_Path}/resources`.replace(/\\/g, '/'),
        defaultLayout:
          `${Version.Plugin_Path}/resources/common/layout/default.html`.replace(
            /\\/g,
            '/',
          ),
        sys: {
          scale: scale(params.scale ?? 1),
        },
        copyright: `${Version.Bot_Name}<span class="version"> ${Version.Bot_Version}</span> & ${Version.Plugin_Name}<span class="version"> ${Version.Plugin_Version}`,
        ...params,
      },
      screensEval: '#containter',
      multiPage: 12000,
      pageGotoParams: {
        waitUntil: 'networkidle0',
        timeout: 60000,
      },
    })
    const ret: ImageElement[] = []
    for (const image of img) {
      const base64Image = image.startsWith('base64://')
        ? image
        : `base64://${image}`
      ret.push(segment.image(base64Image))
    }

    return ret
  },
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

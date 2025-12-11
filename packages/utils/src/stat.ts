import { createCanvas } from 'canvas'
import { drawBackgroundCover, drawCard, drawText } from './draw'

export interface StatItem {
  keywords: string
  count: number
}

export interface StatDrawOptions {
  backgroundPath: string
}

export async function renderStat(
  data: { total: number; memeList: StatItem[] },
  options: StatDrawOptions,
): Promise<Buffer> {
  const config = {
    canvas: {
      width: 1200,
      minHeight: 600,
      padding: 40,
    },
    layout: {
      columnCount: 5,
      columnGap: 16,
      rowGap: 16,
    },
    header: {
      height: 180,
      marginBottom: 24,
      boxHeight: 120,
      borderRadius: 20,
    },
    item: {
      borderRadius: 8,
      padding: 16,
      height: 56,
    },
    colors: {
      headerBg: 'rgba(255, 255, 255, 0.95)',
      itemBg: 'rgba(255, 255, 255, 0.92)',
      titleText: '#1a1a1a',
      subtitleText: '#666',
      keywordText: '#2c3e50',
      countText: '#6366f1',
      countBg: 'rgba(99, 102, 241, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
  }

  const columnWidth = Math.floor(
    (config.canvas.width -
      config.canvas.padding * 2 -
      config.layout.columnGap * (config.layout.columnCount - 1)) /
      config.layout.columnCount,
  )

  const itemsPerColumn = Math.ceil(
    data.memeList.length / config.layout.columnCount,
  )
  const contentHeight =
    itemsPerColumn * config.item.height +
    (itemsPerColumn - 1) * config.layout.rowGap

  const realHeight = Math.max(
    config.canvas.minHeight,
    config.header.height +
      config.header.marginBottom +
      contentHeight +
      config.canvas.padding * 2,
  )

  const canvas = createCanvas(config.canvas.width, realHeight)
  const ctx = canvas.getContext('2d')

  await drawBackgroundCover(
    ctx,
    options.backgroundPath,
    config.canvas.width,
    realHeight,
  )

  await drawHeader(ctx, config, data.total)
  await drawItems(ctx, data.memeList, config, columnWidth, itemsPerColumn)

  const buf = await canvas.toBuffer('image/png')
  return buf
}

async function drawHeader(ctx: any, config: any, total: number) {
  const { padding, width: canvasWidth } = config.canvas
  const { boxHeight, borderRadius } = config.header
  const { headerBg, titleText, subtitleText, shadow } = config.colors

  const headerBoxWidth = canvasWidth - padding * 2
  const headerBoxX = padding
  const headerBoxY = padding

  drawCard(ctx, {
    x: headerBoxX,
    y: headerBoxY,
    width: headerBoxWidth,
    height: boxHeight,
    borderRadius,
    backgroundColor: headerBg,
    shadowColor: shadow,
    shadowBlur: 8,
    shadowOffsetY: 4,
  })

  const gradient = ctx.createLinearGradient(
    headerBoxX,
    headerBoxY,
    headerBoxX,
    headerBoxY + boxHeight,
  )
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)')
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)')
  ctx.fillStyle = gradient
  ctx.fillRect(headerBoxX, headerBoxY, headerBoxWidth, boxHeight)

  const title = '柠糖表情统计'
  drawText(ctx, {
    text: title,
    x: canvasWidth / 2,
    y: padding + 20,
    font: 'bold 52px SmileySans',
    color: titleText,
    textBaseline: 'top',
    textAlign: 'center',
  })

  const subtitle = `表情调用总次数：${total}`
  drawText(ctx, {
    text: subtitle,
    x: canvasWidth / 2,
    y: padding + 78,
    font: '26px SmileySans',
    color: subtitleText,
    textBaseline: 'top',
    textAlign: 'center',
  })
}

async function drawItems(
  ctx: any,
  data: StatItem[],
  config: any,
  columnWidth: number,
  itemsPerColumn: number,
) {
  const { padding } = config.canvas
  const { columnGap, rowGap } = config.layout
  const { height: headerHeight, marginBottom } = config.header
  const { borderRadius, padding: itemPadding, height: itemHeight } = config.item
  const { itemBg, keywordText, countText, countBg, shadow } = config.colors

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const columnIndex = Math.floor(i / itemsPerColumn)
    const rowIndex = i % itemsPerColumn

    const x = padding + columnIndex * (columnWidth + columnGap)
    const y = headerHeight + marginBottom + rowIndex * (itemHeight + rowGap)

    drawCard(ctx, {
      x,
      y,
      width: columnWidth,
      height: itemHeight,
      borderRadius,
      backgroundColor: itemBg,
      shadowColor: shadow,
      shadowBlur: 6,
      shadowOffsetY: 3,
    })

    ctx.save()
    ctx.beginPath()
    ctx.rect(x + itemPadding, y, columnWidth - itemPadding * 2 - 80, itemHeight)
    ctx.clip()

    drawText(ctx, {
      text: item.keywords,
      x: x + itemPadding,
      y: y + itemHeight / 2,
      font: '22px SmileySans, NotoColorEmoji',
      color: keywordText,
      textBaseline: 'middle',
      textAlign: 'left',
    })

    ctx.restore()

    const countTextWidth = ctx.measureText(`${item.count} 次`).width
    const countBgWidth = countTextWidth + 16
    const countBgX = x + columnWidth - itemPadding - countBgWidth
    const countBgY = y + (itemHeight - 28) / 2

    ctx.fillStyle = countBg
    ctx.beginPath()
    ctx.roundRect(countBgX, countBgY, countBgWidth, 28, 14)
    ctx.fill()

    drawText(ctx, {
      text: `${item.count} 次`,
      x: countBgX + countBgWidth / 2,
      y: y + itemHeight / 2,
      font: 'bold 15px SmileySans',
      color: countText,
      textBaseline: 'middle',
      textAlign: 'center',
    })
  }
}

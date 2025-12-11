import { createCanvas, loadImage, type SKRSContext2D } from 'canvas'
import {
  drawBackgroundCover,
  drawCard,
  drawText,
  drawWrappedText,
  drawIcon
} from './draw'

export interface ListItem {
  name: string
  types: string[]
}

export interface DrawOptions {
  backgroundPath: string
  iconsPath: {
    text: string
    image: string
    option: string
  }
}


function calculateTextLines(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
): number {
  const words = text.split('')
  let line = ''
  let lines = 1

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      lines++
      line = words[i]
    } else {
      line = testLine
    }
  }

  return lines
}


function calculateItemHeights(
  ctx: any,
  data: ListItem[],
  config: any,
): number[] {
  const { fontSize, lineHeight, maxWidth } = config.text
  const { verticalPadding, minHeight } = config.item

  ctx.font = `${fontSize}px SmileySans, NotoColorEmoji`

  return data.map((item, i) => {
    const index = i + 1
    const text = `${index}. ${item.name}`
    const lines = calculateTextLines(ctx, text, maxWidth)
    const textHeight = lines * lineHeight
    return Math.max(minHeight, textHeight + verticalPadding * 2)
  })
}

function calculateColumnHeights(
  totalItems: number,
  columnCount: number,
  itemHeights: number[],
  rowGap: number,
): number[] {
  const columnHeights: number[] = Array.from({ length: columnCount }, () => 0)
  const itemsPerColumn = Math.ceil(totalItems / columnCount)

  for (let i = 0; i < totalItems; i++) {
    const columnIndex = Math.floor(i / itemsPerColumn)
    if (columnIndex < columnCount) {
      columnHeights[columnIndex] += itemHeights[i]
      if (i % itemsPerColumn !== itemsPerColumn - 1 && i !== totalItems - 1) {
        columnHeights[columnIndex] += rowGap
      }
    }
  }

  return columnHeights
}

async function drawHeader(
  ctx: any,
  config: any,
  totalCount: number,
  canvasWidth: number,
) {
  const { padding } = config.canvas
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

  const title = '柠糖表情列表'
  drawText(ctx, {
    text: title,
    x: canvasWidth / 2,
    y: padding + 20,
    font: 'bold 52px SmileySans',
    color: titleText,
    textBaseline: 'top',
    textAlign: 'center',
  })

  const subtitle = `共 ${totalCount} 个表情`
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
  data: ListItem[],
  config: any,
  columnWidth: number,
  itemHeights: number[],
  icons: any,
) {
  const { padding } = config.canvas
  const { columnGap, rowGap } = config.layout
  const { height: headerHeight, marginBottom } = config.header
  const { borderRadius, padding: itemPadding, verticalPadding } = config.item
  const { itemBg, itemText, shadow } = config.colors
  const { fontSize, lineHeight, maxWidth } = config.text

  const itemsPerColumn = Math.ceil(data.length / config.layout.columnCount)

  const columnYOffsets: number[] = Array.from(
    { length: config.layout.columnCount },
    () => headerHeight + marginBottom,
  )

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const columnIndex = Math.floor(i / itemsPerColumn)
    const itemHeight = itemHeights[i]

    const x = padding + columnIndex * (columnWidth + columnGap)
    const y = columnYOffsets[columnIndex]

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

    const index = i + 1
    const text = `${index}. ${item.name}`

    drawWrappedText(ctx, {
      text,
      x: x + itemPadding,
      y: y + verticalPadding,
      maxWidth,
      lineHeight,
      font: `${fontSize}px SmileySans, NotoColorEmoji`,
      color: itemText,
    })

    drawItemIcons(ctx, item.types, x, y, columnWidth, config, icons)

    columnYOffsets[columnIndex] += itemHeight + rowGap
  }
}

function drawItemIcons(
  ctx: any,
  types: string[],
  x: number,
  y: number,
  columnWidth: number,
  config: any,
  icons: any,
) {
  const { size: iconSize, gap: iconGap, backgroundSize } = config.icon
  const { padding: itemPadding, verticalPadding } = config.item
  let iconX = x + columnWidth - itemPadding

  const iconMap = [
    {
      type: 'option',
      icon: icons.optionIcon,
      color: 'rgba(139, 92, 246, 0.12)',
    },
    {
      type: 'image',
      icon: icons.imageIcon,
      color: 'rgba(59, 130, 246, 0.12)',
    },
    { type: 'text', icon: icons.textIcon, color: 'rgba(16, 185, 129, 0.12)' },
  ]

  for (const { type, icon, color } of iconMap) {
    if (types.includes(type)) {
      iconX -= backgroundSize
      const iconY = y + verticalPadding

      drawIcon(ctx, {
        icon,
        x: iconX,
        y: iconY,
        size: iconSize,
        backgroundColor: color,
        backgroundSize,
        borderRadius: config.icon.borderRadius,
      })

      iconX -= iconGap
    }
  }
}

export async function renderList(
  data: ListItem[],
  options: DrawOptions,
): Promise<Buffer> {
  const config = {
    canvas: {
      width: 1200,
      minHeight: 600,
      padding: 40,
    },
    layout: {
      columnCount: 3,
      columnGap: 32,
      rowGap: 16,
    },
    header: {
      height: 180,
      marginBottom: 24,
      boxHeight: 120,
      borderRadius: 20,
    },
    item: {
      borderRadius: 10,
      padding: 20,
      verticalPadding: 16,
      minHeight: 56,
    },
    icon: {
      size: 20,
      gap: 10,
      backgroundSize: 32,
      borderRadius: 8,
    },
    text: {
      fontSize: 22,
      lineHeight: 28,
      maxWidth: 0,
    },
    colors: {
      headerBg: 'rgba(255, 255, 255, 0.95)',
      itemBg: 'rgba(255, 255, 255, 0.92)',
      titleText: '#1a1a1a',
      subtitleText: '#666',
      itemText: '#2c3e50',
      shadow: 'rgba(0, 0, 0, 0.12)',
      iconBg: 'rgba(99, 102, 241, 0.1)',
    },
  }

  const columnWidth = Math.floor(
    (config.canvas.width -
      config.canvas.padding * 2 -
      config.layout.columnGap * (config.layout.columnCount - 1)) /
      config.layout.columnCount,
  )

  config.text.maxWidth = columnWidth - config.item.padding * 2 - 120

  const canvas = createCanvas(config.canvas.width, config.canvas.minHeight)
  const ctx = canvas.getContext('2d')
  ctx.font = `${config.text.fontSize}px SmileySans, NotoColorEmoji`

  const itemHeights = calculateItemHeights(ctx, data, config)

  const columnHeights = calculateColumnHeights(
    data.length,
    config.layout.columnCount,
    itemHeights,
    config.layout.rowGap,
  )

  const maxColumnHeight = Math.max(...columnHeights)
  const realHeight = Math.max(
    config.canvas.minHeight,
    config.header.height +
      config.header.marginBottom +
      maxColumnHeight +
      config.canvas.padding * 2,
  )

  const finalCanvas = createCanvas(config.canvas.width, realHeight)
  const finalCtx = finalCanvas.getContext('2d')

  await drawBackgroundCover(
    finalCtx,
    options.backgroundPath,
    config.canvas.width,
    realHeight,
  )
  await drawHeader(finalCtx, config, data.length, config.canvas.width)

  const [textIcon, imageIcon, optionIcon] = await Promise.all([
    loadImage(options.iconsPath.text),
    loadImage(options.iconsPath.image),
    loadImage(options.iconsPath.option),
  ])
  const icons = { textIcon, imageIcon, optionIcon }

  await drawItems(finalCtx, data, config, columnWidth, itemHeights, icons)

  const buf = await finalCanvas.toBuffer('image/png')
  return buf
}

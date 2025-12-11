import { loadImage, type SKRSContext2D, type Image } from 'canvas'

export interface DrawImageOptions {
  path: string
  x: number
  y: number
  width: number
  height: number
}

export interface DrawCardOptions {
  x: number
  y: number
  width: number
  height: number
  borderRadius: number
  backgroundColor: string
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetY?: number
}

export interface DrawTextOptions {
  text: string
  x: number
  y: number
  font: string
  color: string
  textBaseline?: CanvasTextBaseline
  textAlign?: CanvasTextAlign
  maxWidth?: number
}

export interface DrawWrappedTextOptions {
  text: string
  x: number
  y: number
  maxWidth: number
  lineHeight: number
  font: string
  color: string
}

export interface DrawIconOptions {
  icon: Image
  x: number
  y: number
  size: number
  backgroundColor: string
  backgroundSize: number
  borderRadius: number
}

export async function drawImage(
  ctx: SKRSContext2D,
  options: DrawImageOptions,
): Promise<void> {
  const img = await loadImage(options.path)
  ctx.drawImage(img, options.x, options.y, options.width, options.height)
}

export async function drawBackgroundCover(
  ctx: SKRSContext2D,
  backgroundPath: string,
  width: number,
  height: number,
): Promise<void> {
  const bg = await loadImage(backgroundPath)

  const bgWidth = bg.width
  const bgHeight = bg.height
  const canvasRatio = width / height
  const bgRatio = bgWidth / bgHeight

  let drawWidth = width
  let drawHeight = height
  let offsetX = 0
  let offsetY = 0

  if (canvasRatio > bgRatio) {
    drawHeight = width / bgRatio
    offsetY = (height - drawHeight) / 2
  } else {
    drawWidth = height * bgRatio
    offsetX = (width - drawWidth) / 2
  }

  ctx.drawImage(bg, offsetX, offsetY, drawWidth, drawHeight)

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.03)')
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0.03)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export function drawCard(ctx: SKRSContext2D, options: DrawCardOptions): void {
  ctx.save()

  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor
    ctx.shadowBlur = options.shadowBlur || 0
    ctx.shadowOffsetY = options.shadowOffsetY || 0
  }

  ctx.fillStyle = options.backgroundColor
  ctx.beginPath()
  ctx.roundRect(
    options.x,
    options.y,
    options.width,
    options.height,
    options.borderRadius,
  )
  ctx.fill()

  ctx.restore()
}

export function drawText(ctx: SKRSContext2D, options: DrawTextOptions): void {
  ctx.save()

  ctx.font = options.font
  ctx.fillStyle = options.color
  if (options.textBaseline) ctx.textBaseline = options.textBaseline
  if (options.textAlign) ctx.textAlign = options.textAlign

  if (options.maxWidth) {
    ctx.fillText(options.text, options.x, options.y, options.maxWidth)
  } else {
    ctx.fillText(options.text, options.x, options.y)
  }

  ctx.restore()
}

export function drawWrappedText(
  ctx: SKRSContext2D,
  options: DrawWrappedTextOptions,
): void {
  ctx.save()

  ctx.font = options.font
  ctx.fillStyle = options.color
  ctx.textBaseline = 'top'

  const words = options.text.split('')
  let line = ''
  let currentY = options.y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > options.maxWidth && i > 0) {
      ctx.fillText(line, options.x, currentY)
      line = words[i]
      currentY += options.lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, options.x, currentY)

  ctx.restore()
}

export function drawIcon(ctx: SKRSContext2D, options: DrawIconOptions): void {
  ctx.save()

  ctx.fillStyle = options.backgroundColor
  ctx.beginPath()
  ctx.roundRect(
    options.x,
    options.y,
    options.backgroundSize,
    options.backgroundSize,
    options.borderRadius,
  )
  ctx.fill()

  const iconOffset = (options.backgroundSize - options.size) / 2
  ctx.drawImage(
    options.icon,
    options.x + iconOffset,
    options.y + iconOffset,
    options.size,
    options.size,
  )

  ctx.restore()
}

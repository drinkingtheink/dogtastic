import { buildMotif } from './motif'

const MAX_WIDTH = 1600

/** "The Basilisk" -> "dogtastic-the-basilisk.png" */
function filenameFor (name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `dogtastic-${slug || 'pooch'}.png`
}

/**
 * Renders the close-up exactly as it looks on screen -- photo, motif and
 * caption, in the arrangement the person left them -- and hands it back as
 * a PNG.
 *
 * The motif is rebuilt from the same seed the component drew from, so the
 * download matches what is on screen rather than a fresh scattering.
 */
export async function downloadCard (dog, {
  count = 16,
  theme = 'light',
  displayWidth = 0,
  captionPx = 0
} = {}) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = dog.image
  await image.decode()

  const scale = Math.min(1, MAX_WIDTH / image.naturalWidth)
  const width = Math.round(image.naturalWidth * scale)
  const height = Math.round(image.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0, width, height)

  const motif = buildMotif({ seed: dog.id, count, layout: 'cluster', theme })

  /* Glyphs are sized in rem against the photo as displayed, so the export
     has to scale by how much bigger the canvas is than what was on screen.
     A fixed reference width here made every download half size. */
  const rootPx = 16
  const sizeScale = displayWidth > 0 ? width / displayWidth : 1
  const offsetX = ((dog.motifX ?? 0) / 100) * width
  const offsetY = ((dog.motifY ?? 0) / 100) * height

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const item of motif.items) {
    const size = item.rem * rootPx * sizeScale
    ctx.save()
    ctx.globalAlpha = item.opacity
    ctx.fillStyle = item.color
    ctx.translate((item.x / 100) * width + offsetX, (item.y / 100) * height + offsetY)
    ctx.rotate((item.rotation * Math.PI) / 180)
    ctx.font = `${size}px serif`
    ctx.fillText(item.glyph, 0, 0)
    ctx.restore()
  }

  // The display face has to be loaded before the canvas can use it.
  const captionSize = (captionPx > 0 ? captionPx : 26) * sizeScale
  const captionFont = `${captionSize}px "Bungee Inline", sans-serif`
  try {
    await document.fonts.load(captionFont)
  } catch {
    // Falls back to the generic sans-serif below.
  }

  ctx.save()
  ctx.font = captionFont
  ctx.textAlign = 'left'
  ctx.translate(
    (motif.captionX / 100) * width + offsetX,
    height - (motif.captionBottom / 100) * height + offsetY
  )
  ctx.rotate((motif.captionRotation * Math.PI) / 180)
  ctx.lineWidth = captionSize * 0.22
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.lineJoin = 'round'
  ctx.strokeText(motif.caption, 0, 0)
  ctx.fillStyle = '#12836d'
  ctx.fillText(motif.caption, 0, 0)
  ctx.restore()

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not render the card')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filenameFor(dog.name)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

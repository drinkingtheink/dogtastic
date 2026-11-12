/**
 * The whole kennel as one shareable sheet.
 *
 * Three things decide how this behaves at size:
 *
 * - Format. A hundred dogs is 16MB as a PNG and 1.9MB as a JPEG, because
 *   photographs do not compress losslessly. Single cards stay PNG; a
 *   contact sheet does not.
 * - Canvas area. Browsers silently hand back a blank canvas past their
 *   limit, and phones give up far earlier than desktops, so the cells
 *   shrink to keep any kennel inside a budget rather than trusting the
 *   machine it happens to run on.
 * - Memory. Decoding every photo at once would hold hundreds of bitmaps
 *   live, so they are drawn and released in batches.
 */

const MEGAPIXEL_BUDGET = 24e6
const MAX_CELL = 320
const MIN_CELL = 120
const BATCH = 20
const PLATE_RATIO = 0.26
const PHOTO_RATIO = 0.75

const YELLOW = '#facc43'
const PLATE = '#12836d'
const INK = '#0f4c40'

/* Below the legibility floor the budget can no longer be met, and a canvas
   past its limit comes back blank rather than failing loudly. Past this
   many dogs the sheet takes the most recent and says so. */
export const MAX_ON_SHEET = Math.floor(
  MEGAPIXEL_BUDGET / (MIN_CELL * MIN_CELL * (PHOTO_RATIO + PLATE_RATIO))
)

function layoutFor (count) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * 1.4)))
  const rows = Math.ceil(count / columns)

  // Each cell occupies cell * (cell * PHOTO_RATIO + cell * PLATE_RATIO).
  const perCell = PHOTO_RATIO + PLATE_RATIO
  const ideal = Math.sqrt(MEGAPIXEL_BUDGET / (count * perCell))
  const cell = Math.round(Math.min(MAX_CELL, Math.max(MIN_CELL, ideal)))

  return { columns, rows, cell, cellHeight: Math.round(cell * perCell) }
}

async function decode (url) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = url
  await image.decode()
  return image
}

/** Mirrors background-size: cover with background-position from the card. */
function drawCover (ctx, image, x, y, width, height, focusX, focusY) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawnWidth = image.naturalWidth * scale
  const drawnHeight = image.naturalHeight * scale

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  ctx.drawImage(
    image,
    x - (drawnWidth - width) * focusX,
    y - (drawnHeight - height) * focusY,
    drawnWidth,
    drawnHeight
  )
  ctx.restore()
}

function fitText (ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text

  let trimmed = text
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}...`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1)
  }
  return `${trimmed}...`
}

export async function downloadKennel (allDogs, { onProgress } = {}) {
  if (!allDogs.length) throw new Error('Nothing in the kennel')

  // Newest first, so this keeps the most recent arrivals.
  const dogs = allDogs.slice(0, MAX_ON_SHEET)
  const omitted = allDogs.length - dogs.length

  const { columns, rows, cell, cellHeight } = layoutFor(dogs.length)
  const breeds = new Set(dogs.map(dog => dog.breed).filter(Boolean)).size
  const headerHeight = Math.round(cell * 0.62)

  const canvas = document.createElement('canvas')
  canvas.width = columns * cell
  canvas.height = headerHeight + rows * cellHeight
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = YELLOW
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Header
  const titleSize = Math.round(cell * 0.26)
  const titleFont = `${titleSize}px "Bungee Inline", sans-serif`
  try {
    await document.fonts.load(titleFont)
  } catch {
    // Falls back to the generic sans-serif.
  }

  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = titleFont
  ctx.fillText('Dogtastic!', canvas.width / 2, headerHeight * 0.38)
  ctx.font = `bold ${Math.round(cell * 0.11)}px sans-serif`
  ctx.fillText(
    `${dogs.length} ${dogs.length === 1 ? 'pooch' : 'pooches'} · ${breeds} ${breeds === 1 ? 'breed' : 'breeds'}`,
    canvas.width / 2,
    headerHeight * 0.72
  )

  const photoHeight = Math.round(cell * PHOTO_RATIO)
  const plateHeight = cellHeight - photoHeight
  const gap = Math.max(2, Math.round(cell * 0.02))

  // Drawn and released in batches, so a large kennel does not hold every
  // decoded photo in memory at once.
  for (let start = 0; start < dogs.length; start += BATCH) {
    const slice = dogs.slice(start, start + BATCH)
    const images = await Promise.all(
      slice.map(dog => decode(dog.image).catch(() => null))
    )

    images.forEach((image, offset) => {
      const index = start + offset
      const dog = dogs[index]
      const x = (index % columns) * cell
      const y = headerHeight + Math.floor(index / columns) * cellHeight

      if (image) {
        drawCover(
          ctx, image,
          x + gap, y + gap, cell - gap * 2, photoHeight - gap,
          dog.focusX ?? 0.5, dog.focusY ?? 0.5
        )
      } else {
        ctx.fillStyle = INK
        ctx.fillRect(x + gap, y + gap, cell - gap * 2, photoHeight - gap)
      }

      ctx.fillStyle = PLATE
      ctx.fillRect(x + gap, y + photoHeight, cell - gap * 2, plateHeight - gap * 2)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = `bold ${Math.round(cell * 0.085)}px sans-serif`
      ctx.fillText(
        fitText(ctx, dog.name, cell - gap * 4),
        x + cell / 2,
        y + photoHeight + plateHeight * 0.36
      )

      if (dog.breed) {
        ctx.font = `bold ${Math.round(cell * 0.058)}px sans-serif`
        ctx.globalAlpha = 0.85
        ctx.fillText(
          fitText(ctx, dog.breed.toUpperCase(), cell - gap * 4),
          x + cell / 2,
          y + photoHeight + plateHeight * 0.66
        )
        ctx.globalAlpha = 1
      }
    })

    onProgress?.(Math.min(start + BATCH, dogs.length), dogs.length)
  }

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.88))
  canvas.width = canvas.height = 0
  if (!blob) throw new Error('Could not render the kennel')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'dogtastic-kennel-poster.jpg'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return { drawn: dogs.length, omitted, megapixels: (columns * cell * (headerHeight + rows * cellHeight)) / 1e6 }
}

/**
 * The hearts-and-sparkles motif.
 *
 * Generated here rather than inside the component so the same arrangement
 * can be drawn twice: once as DOM for the screen, once onto a canvas for
 * the download. Seeding it keeps a dog's motif the same between visits,
 * which also means the caption stops rerolling every time you look.
 */

const HEARTS = ['♥', '❤']
const SPARKLES = ['✦', '✧', '✴']

const PALETTES = {
  light: ['#25bea0', '#12836d', '#fabc09', '#08705b'],
  dark: ['#ffffff', '#facc43', '#25bea0', '#fabc09']
}

export const CAPTIONS = [
  'My Boo',
  'Da Best',
  'Certified Floof',
  '10/10 would pet',
  'Absolute Unit',
  'Top Dog',
  'Heckin Cute',
  'Mayor of My Heart',
  'No Notes',
  'Smol Bean',
  'Best in Show',
  'Pure of Heart',
  'Employee of the Month',
  'Wow. Just Wow.',
  'Simply The Finest'
]

function hash (value) {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32 - small, fast, good enough for scattering glyphs. */
function seeded (value) {
  let a = hash(String(value))
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Gathered into the bottom-left; squaring thickens the heap at the corner. */
function cluster (random) {
  return {
    x: 4 + random() ** 1.7 * 38,
    y: 90 - random() ** 1.7 * 38
  }
}

/** Rings the frame, keeping the middle clear because that is where the dog is. */
function scatter (random) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const x = 3 + random() * 94
    const y = 3 + random() * 94
    if (Math.abs(x - 50) > 26 || Math.abs(y - 50) > 31) return { x, y }
  }
  return { x: 3 + random() * 11, y: 3 + random() * 94 }
}

export function buildMotif ({ seed = null, count = 16, layout = 'cluster', theme = 'light' } = {}) {
  const random = seed === null ? Math.random : seeded(seed)
  const range = (min, max) => min + random() * (max - min)
  const pick = list => list[Math.floor(random() * list.length)]
  const palette = PALETTES[theme] ?? PALETTES.light

  const items = Array.from({ length: count }, (_, id) => {
    const isHeart = random() < 0.45
    const place = layout === 'cluster' ? cluster(random) : scatter(random)

    return {
      id,
      kind: isHeart ? 'heart' : 'sparkle',
      glyph: isHeart ? pick(HEARTS) : pick(SPARKLES),
      x: place.x,
      y: place.y,
      rem: +range(1.3, 3.1).toFixed(2),
      color: pick(palette),
      rotation: +range(-28, 28).toFixed(1),
      duration: +range(2.4, 4.6).toFixed(2),
      delay: +range(0, 2.4).toFixed(2),
      opacity: +range(0.55, 1).toFixed(2)
    }
  })

  return {
    items,
    caption: pick(CAPTIONS),
    captionX: +range(5, 11).toFixed(1),
    captionBottom: +range(16, 26).toFixed(1),
    captionRotation: +range(-9, 5).toFixed(1)
  }
}

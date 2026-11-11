<template>
  <canvas ref="canvasEl" class="confetti-canvas" aria-hidden="true" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

const props = defineProps({
  /** Burst origin, in viewport fractions (0-1). */
  origin: {
    type: Object,
    default: () => ({ x: 0.5, y: 0.45 })
  }
})

const emit = defineEmits(['done'])

const canvasEl = useTemplateRef('canvasEl')

/* Brand greens and yellows first so the burst reads as this app's, with a
   spread of party colours behind them. */
const COLORS = [
  '#25bea0', '#12836d', '#fabc09', '#facc43', '#00d0c5',
  'gold', 'orange', 'tomato', 'hotpink', 'violet',
  'deepskyblue', 'aquamarine', 'lawngreen', 'darkturquoise'
]

const SHAPES = ['rect', 'circle', 'ribbon', 'star']

const GRAVITY = 0.32
const DRAG = 0.988
const TERMINAL = 14

let ctx = null
let raf = null
let particles = []
let dpr = 1

const rand = (min, max) => min + Math.random() * (max - min)
const pick = list => list[Math.floor(Math.random() * list.length)]

function makeParticle (x, y, angle, speed, overrides = {}) {
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: rand(6, 13),
    color: pick(COLORS),
    shape: pick(SHAPES),
    rotation: rand(0, Math.PI * 2),
    spin: rand(-0.3, 0.3),
    // Drives the width squash that reads as a piece flipping in 3D.
    flip: rand(0, Math.PI * 2),
    flipRate: rand(0.08, 0.2),
    life: 0,
    maxLife: rand(90, 160),
    wobble: rand(0, Math.PI * 2),
    ...overrides
  }
}

/** The main blast out of the portrait. */
function burst (cx, cy) {
  for (let i = 0; i < 110; i++) {
    // Biased upward: a cone that still throws some pieces sideways.
    const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05) + rand(-0.35, 0.35)
    particles.push(makeParticle(cx, cy, angle, rand(7, 19)))
  }
}

/** Two cannons firing inward from the lower corners. */
function cannons (w, h) {
  for (let i = 0; i < 28; i++) {
    particles.push(makeParticle(0, h * 0.95, rand(-1.15, -0.65), rand(14, 23)))
    particles.push(makeParticle(w, h * 0.95, rand(-Math.PI + 0.65, -Math.PI + 1.15), rand(14, 23)))
  }
}

/** A late drift of pieces falling in from above. */
function sprinkle (w) {
  for (let i = 0; i < 45; i++) {
    particles.push(makeParticle(rand(0, w), rand(-140, -20), Math.PI / 2, rand(1, 4), {
      maxLife: rand(140, 220)
    }))
  }
}

function drawStar (c, r) {
  c.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45
    const a = (Math.PI / 5) * i - Math.PI / 2
    c[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * radius, Math.sin(a) * radius)
  }
  c.closePath()
  c.fill()
}

function draw (p) {
  const fade = p.life > p.maxLife - 35 ? Math.max(0, (p.maxLife - p.life) / 35) : 1

  ctx.save()
  ctx.globalAlpha = fade
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.fillStyle = p.color

  // Squashing the width as `flip` advances gives the pieces a tumbling,
  // three-dimensional feel without any 3D maths.
  const squash = Math.abs(Math.cos(p.flip))

  if (p.shape === 'circle') {
    ctx.beginPath()
    ctx.ellipse(0, 0, (p.size / 2) * squash, p.size / 2, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.shape === 'ribbon') {
    ctx.fillRect((-p.size * 1.6) / 2, -p.size / 6, p.size * 1.6 * squash, p.size / 3)
  } else if (p.shape === 'star') {
    ctx.scale(squash, 1)
    drawStar(ctx, p.size * 0.7)
  } else {
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size * squash, p.size)
  }

  ctx.restore()
}

function tick () {
  const { width, height } = canvasEl.value
  ctx.clearRect(0, 0, width, height)

  particles = particles.filter(p => {
    p.life++
    p.vy = Math.min(p.vy + GRAVITY, TERMINAL)
    p.vx *= DRAG
    p.vy *= DRAG

    // A touch of lateral sway so pieces flutter rather than fall straight.
    p.wobble += 0.08
    p.x += p.vx + Math.sin(p.wobble) * 0.6
    p.y += p.vy
    p.rotation += p.spin
    p.flip += p.flipRate

    draw(p)

    return p.life < p.maxLife && p.y < height / dpr + 60
  })

  if (particles.length === 0) {
    raf = null
    emit('done')
    return
  }

  raf = requestAnimationFrame(tick)
}

function resize () {
  const canvas = canvasEl.value
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
  // Nothing should fly across the screen for someone who asked for less
  // motion; the component simply reports itself finished.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('done')
    return
  }

  resize()
  window.addEventListener('resize', resize)

  const w = window.innerWidth
  const h = window.innerHeight

  burst(w * props.origin.x, h * props.origin.y)
  cannons(w, h)
  setTimeout(() => sprinkle(w), 260)

  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  particles = []
})
</script>

<style scoped>
.confetti-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 60;
}
</style>

<template>
  <div ref="el" class="flying-name" aria-hidden="true">{{ text }}</div>
</template>

<script setup>
import { onMounted, useTemplateRef } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  /** Viewport pixel coordinates. */
  from: { type: Object, required: true },
  to: { type: Object, required: true }
})

const emit = defineEmits(['done'])

const el = useTemplateRef('el')

const DURATION = 820
const STEPS = 26
const ARC_HEIGHT = 150

onMounted(() => {
  const { from, to } = props

  // A quadratic bezier whose control point sits above both ends, so the
  // name is lobbed into the kennel rather than sliding there.
  const peakY = Math.min(from.y, to.y) - ARC_HEIGHT
  const midX = (from.x + to.x) / 2

  const frames = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const inv = 1 - t
    const x = inv * inv * from.x + 2 * inv * t * midX + t * t * to.x
    const y = inv * inv * from.y + 2 * inv * t * peakY + t * t * to.y

    // Swells as it rises, then drops into the kennel.
    const scale = t > 0.9 ? 0.35 : 1 + 0.45 * Math.sin(Math.PI * t)

    frames.push({
      offset: t,
      opacity: t > 0.9 ? 0 : 1,
      transform:
        `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) ` +
        `scale(${scale}) rotate(${t * 540}deg)`
    })
  }

  const animation = el.value.animate(frames, {
    duration: DURATION,
    easing: 'cubic-bezier(0.35, 0, 0.3, 1)',
    fill: 'forwards'
  })

  animation.onfinish = () => emit('done')
  animation.oncancel = () => emit('done')
})
</script>

<style scoped>
.flying-name {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 70;
  pointer-events: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background-color: var(--color-green-plate);
  color: var(--color-surface);
  font-family: var(--font-body);
  font-weight: bold;
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
}
</style>

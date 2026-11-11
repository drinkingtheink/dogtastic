<template>
  <div
    class="pup-decor"
    :class="[theme, { animated, movable }]"
    :style="{ transform: `translate(${offset.x}%, ${offset.y}%)` }"
    :aria-hidden="movable ? null : 'true'"
    :role="movable ? 'group' : null"
    :aria-label="movable ? `Decorations reading ${motif.caption}. Drag to move.` : null"
    @pointerdown="startDrag"
    @pointermove="onDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
  >
    <span
      v-for="item in motif.items"
      :key="item.id"
      class="decor"
      :class="item.kind"
      :style="styleFor(item)"
    >{{ item.glyph }}</span>

    <p v-if="caption" class="decor-caption" :style="captionStyle">
      {{ motif.caption }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { buildMotif } from '../utils/motif'

const props = defineProps({
  count: { type: Number, default: 18 },
  /** Still for a photo you are looking at; drifting for one that plays. */
  animated: { type: Boolean, default: false },
  theme: { type: String, default: 'light' },
  /** 'scatter' rings the frame; 'cluster' gathers it into the bottom-left. */
  layout: { type: String, default: 'scatter' },
  caption: { type: Boolean, default: false },
  /** Keeps a dog's arrangement the same between visits. */
  seed: { type: [String, Number], default: null },
  /** Where the whole group sits, as a percentage nudge from where it was. */
  offsetX: { type: Number, default: 0 },
  offsetY: { type: Number, default: 0 },
  movable: { type: Boolean, default: false }
})

const emit = defineEmits(['move'])

const motif = buildMotif({
  seed: props.seed,
  count: props.count,
  layout: props.layout,
  theme: props.theme
})

const preview = ref(null)
let origin = null

const offset = computed(() => preview.value ?? { x: props.offsetX, y: props.offsetY })

function styleFor (item) {
  return {
    left: `${item.x}%`,
    top: `${item.y}%`,
    fontSize: `${item.rem}rem`,
    color: item.color,
    opacity: item.opacity,
    '--rot': `${item.rotation}deg`,
    '--dur': `${item.duration}s`,
    '--delay': `${item.delay}s`
  }
}

const captionStyle = computed(() => ({
  left: `${motif.captionX}%`,
  bottom: `${motif.captionBottom}%`,
  '--rot': `${motif.captionRotation}deg`
}))

/* Kept within the frame, so the motif cannot be dragged out of sight. */
const clamp = value => Math.min(45, Math.max(-45, value))

function startDrag (event) {
  if (!props.movable) return

  origin = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    x: offset.value.x,
    y: offset.value.y,
    width: event.currentTarget.clientWidth,
    height: event.currentTarget.clientHeight
  }

  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // Dragging still works, it just stops at the frame's edge.
  }
}

function onDrag (event) {
  if (!origin) return

  preview.value = {
    x: clamp(origin.x + ((event.clientX - origin.pointerX) / origin.width) * 100),
    y: clamp(origin.y + ((event.clientY - origin.pointerY) / origin.height) * 100)
  }
}

function endDrag (event) {
  if (!origin) return
  origin = null

  // Save before releasing: releasing a capture the browser is no longer
  // tracking throws, and that would take the save with it.
  if (preview.value) {
    emit('move', preview.value)
    preview.value = null
  }

  try {
    event.currentTarget.releasePointerCapture(event.pointerId)
  } catch {
    // Already released, or never captured.
  }
}

defineExpose({ motif })
</script>

<style scoped>
.pup-decor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.pup-decor.movable {
  pointer-events: auto;
  cursor: grab;
}

.pup-decor.movable:active {
  cursor: grabbing;
}

.decor {
  position: absolute;
  line-height: 1;
  transform: translate(-50%, -50%) rotate(var(--rot));
}

/* A soft halo so a glyph stays readable whether it lands on the surface or
   on the photo. */
.pup-decor.light .decor {
  text-shadow: 0 1px 4px rgb(255 255 255 / 75%);
}

.pup-decor.dark .decor {
  text-shadow: 0 1px 5px rgb(11 59 50 / 55%);
}

.decor-caption {
  position: absolute;
  z-index: 1;
  margin: 0;
  max-width: 11rem;
  transform: rotate(var(--rot));
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 3.4vw, 1.6rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
}

.pup-decor.light .decor-caption {
  color: var(--color-green-plate);
  text-shadow:
    0 0 6px rgb(255 255 255 / 95%),
    0 2px 10px rgb(255 255 255 / 85%);
}

.pup-decor.dark .decor-caption {
  color: var(--color-surface);
  text-shadow: 0 2px 8px rgb(11 59 50 / 70%);
}

.animated .heart {
  animation: decor-float var(--dur) ease-in-out var(--delay) infinite;
}

.animated .sparkle {
  animation: decor-twinkle var(--dur) ease-in-out var(--delay) infinite;
}

@keyframes decor-float {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(var(--rot)) translateY(6px);
  }

  50% {
    transform: translate(-50%, -50%) rotate(var(--rot)) translateY(-10px) scale(1.1);
  }
}

@keyframes decor-twinkle {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(var(--rot)) scale(0.7);
    opacity: 0.45;
  }

  50% {
    transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.2);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated .heart,
  .animated .sparkle {
    animation: none;
  }
}
</style>

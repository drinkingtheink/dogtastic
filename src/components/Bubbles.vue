<template>
  <div class="bubble-canvas" aria-hidden="true">
    <div
      v-for="(bubble, index) in bubbles"
      :key="index"
      class="bubbles"
      :style="bubble"
    />
  </div>
</template>

<script setup>
const COLORS = [
  'gold', 'orange', 'tomato', 'lightpink', 'hotpink', 'violet',
  'rebeccapurple', 'deepskyblue', 'aquamarine', 'lightgreen',
  'lawngreen', 'lightseagreen', 'teal', 'darkturquoise'
]

const BUBBLE_COUNT = 12
const LAYERS_PER_BUBBLE = 15

/* Spread radius and vertical jitter per layer, carried over from the
   original Sass so the confetti keeps its old texture. */
const LAYER_SHAPE = [
  { rise: 10, spread: 2 }, { rise: 20, spread: 3 }, { rise: 30, spread: 1 },
  { rise: 5, spread: 5 }, { rise: 18, spread: 6 }, { rise: 30, spread: 3 },
  { rise: 12, spread: 5 }, { rise: 30, spread: 5 }, { rise: 40, spread: 2 },
  { rise: 10, spread: 5 }, { rise: 20, spread: 2 }, { rise: 4, spread: 5 },
  { rise: 20, spread: 2 }, { rise: 30, spread: 1 }, { rise: 4, spread: 6 }
]

const randomInt = max => Math.floor(Math.random() * max) + 1
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

/**
 * Builds each bubble's stack of box-shadows.
 *
 * Sass did this with @for and random(), which meant the "randomness" was
 * fixed at compile time and identical on every page load. Generating it
 * here means a fresh scatter every time the bubbles appear.
 */
function buildBubble () {
  const shadow = Array.from({ length: LAYERS_PER_BUBBLE }, (_, layer) => {
    const { rise, spread } = LAYER_SHAPE[layer]
    return `${randomInt(100)}vw ${-randomInt(rise)}px 0 ${spread}px ${randomColor()}`
  }).join(', ')

  return {
    boxShadow: shadow,
    animation: `bubble-up ${randomInt(5) + 5}s linear ${randomInt(1000)}ms infinite`
  }
}

const bubbles = Array.from({ length: BUBBLE_COUNT }, buildBubble)
</script>

<style scoped>
/* Each bubble's dots are placed with vw offsets, so they were always meant
   to span the window. This used to be absolute inside .img-stage, which was
   as wide as the column; once that element was narrowed to hug the portrait
   the dots got sliced off at the circle's edges. Fixed to the viewport, the
   overflow rule now only trims what is genuinely off-screen. */
.bubble-canvas {
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 59;
}

.bubbles {
  position: absolute;
  top: 72vh;
  width: 15px;
  height: 15px;
  margin-left: -15px;
  background: transparent;
  opacity: 0.8;
  border-radius: 50%;
}

@media (prefers-reduced-motion: reduce) {
  .bubble-canvas {
    display: none;
  }
}
</style>

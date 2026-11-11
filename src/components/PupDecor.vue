<template>
  <div class="pup-decor" :class="[theme, { animated }]" aria-hidden="true">
    <span
      v-for="item in items"
      :key="item.id"
      class="decor"
      :class="item.kind"
      :style="item.style"
    >{{ item.glyph }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  count: {
    type: Number,
    default: 18
  },
  /** Still for a photo you are looking at; drifting for one that plays. */
  animated: {
    type: Boolean,
    default: false
  },
  /** Which surface it sits on, which decides the colours. */
  theme: {
    type: String,
    default: 'light'
  }
})

const HEARTS = ['♥', '❤']
const SPARKLES = ['✦', '✧', '✴']

const PALETTES = {
  light: ['#25bea0', '#12836d', '#fabc09', '#08705b'],
  dark: ['#ffffff', '#facc43', '#25bea0', '#fabc09']
}

const rand = (min, max) => min + Math.random() * (max - min)
const pick = list => list[Math.floor(Math.random() * list.length)]

/* Keeps the middle of the frame clear, because that is where the dog is.
   Falls through after a few tries rather than looping forever. */
function scatter () {
  for (let attempt = 0; attempt < 12; attempt++) {
    const x = rand(3, 97)
    const y = rand(3, 97)
    if (Math.abs(x - 50) > 26 || Math.abs(y - 50) > 31) return { x, y }
  }
  return { x: rand(3, 14), y: rand(3, 97) }
}

const items = Array.from({ length: props.count }, (_, id) => {
  const isHeart = Math.random() < 0.45
  const { x, y } = scatter()

  return {
    id,
    kind: isHeart ? 'heart' : 'sparkle',
    glyph: isHeart ? pick(HEARTS) : pick(SPARKLES),
    style: {
      left: `${x}%`,
      top: `${y}%`,
      fontSize: `${rand(0.7, 1.9).toFixed(2)}rem`,
      color: pick(PALETTES[props.theme] ?? PALETTES.light),
      '--rot': `${rand(-28, 28).toFixed(1)}deg`,
      '--dur': `${rand(2.4, 4.6).toFixed(2)}s`,
      '--delay': `${rand(0, 2.4).toFixed(2)}s`,
      opacity: rand(0.55, 1).toFixed(2)
    }
  }
})
</script>

<style scoped>
.pup-decor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
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

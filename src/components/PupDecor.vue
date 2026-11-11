<template>
  <div class="pup-decor" :class="[theme, { animated }]" aria-hidden="true">
    <span
      v-for="item in items"
      :key="item.id"
      class="decor"
      :class="item.kind"
      :style="item.style"
    >{{ item.glyph }}</span>

    <p v-if="caption" class="decor-caption" :style="captionStyle">
      {{ captionText }}
    </p>
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
  },
  /**
   * 'scatter' rings the frame; 'cluster' gathers everything into the
   * bottom-left so a photo is decorated rather than covered.
   */
  layout: {
    type: String,
    default: 'scatter'
  },
  /** Adds a sticker-ish caption in among the glyphs. */
  caption: {
    type: Boolean,
    default: false
  }
})

const CAPTIONS = [
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

/* Gathered into the bottom-left. Squaring the random thickens the pile
   toward the corner instead of spreading it evenly over a quarter. */
function cluster () {
  return {
    x: 4 + Math.random() ** 1.7 * 38,
    y: 90 - Math.random() ** 1.7 * 38
  }
}

const items = Array.from({ length: props.count }, (_, id) => {
  const isHeart = Math.random() < 0.45
  const { x, y } = props.layout === 'cluster' ? cluster() : scatter()

  return {
    id,
    kind: isHeart ? 'heart' : 'sparkle',
    glyph: isHeart ? pick(HEARTS) : pick(SPARKLES),
    style: {
      left: `${x}%`,
      top: `${y}%`,
      fontSize: `${rand(1.3, 3.1).toFixed(2)}rem`,
      color: pick(PALETTES[props.theme] ?? PALETTES.light),
      '--rot': `${rand(-28, 28).toFixed(1)}deg`,
      '--dur': `${rand(2.4, 4.6).toFixed(2)}s`,
      '--delay': `${rand(0, 2.4).toFixed(2)}s`,
      opacity: rand(0.55, 1).toFixed(2)
    }
  }
})

const captionText = pick(CAPTIONS)

/* Sits in the thick of the pile rather than beside it, tilted so it reads
   as a sticker someone slapped on. */
const captionStyle = {
  left: `${rand(5, 11).toFixed(1)}%`,
  bottom: `${rand(16, 26).toFixed(1)}%`,
  '--rot': `${rand(-9, 5).toFixed(1)}deg`
}
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

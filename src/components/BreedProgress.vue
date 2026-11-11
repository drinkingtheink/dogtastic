<template>
  <section v-if="ready" class="breed-progress">
    <h2 class="breed-progress-label">Breeds collected</h2>

    <p class="breed-progress-figure">
      <span class="breed-progress-count">{{ collectedCount }}</span>
      <span class="breed-progress-total">of {{ catalog.length }}</span>
    </p>

    <!-- One mark per breed: the meter track and the tally are the same
         object, so you can see how far along you are and which ones are
         still missing. -->
    <div
      class="breed-grid"
      role="img"
      :aria-label="`${collectedCount} of ${catalog.length} dog breeds collected`"
    >
      <span
        v-for="breed in catalog"
        :key="breed"
        class="breed-dot"
        :class="{ collected: collected.has(breed) }"
        @mouseenter="showTip(breed, $event)"
        @mouseleave="hideTip"
      />
    </div>

    <!-- Out to the body so the rail's bounds cannot clip it. -->
    <Teleport to="body">
      <div
        v-if="tip"
        ref="tipEl"
        class="breed-tip"
        :class="{ collected: tip.collected }"
        :style="{ left: `${tip.left}px`, top: `${tip.top}px` }"
        aria-hidden="true"
      >
        {{ tip.breed }}
        <span class="breed-tip-state">{{ tip.collected ? 'collected' : 'not yet' }}</span>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, ref, nextTick, useTemplateRef } from 'vue'
import { useBreedCatalog } from '../composables/useBreedCatalog'

const props = defineProps({
  dogs: {
    type: Array,
    default: () => []
  }
})

const { catalog, ready } = useBreedCatalog()

const collected = computed(
  () => new Set(props.dogs.map(dog => dog.breed).filter(Boolean))
)

/* Counted against the catalog rather than off the kennel, so a breed the
   catalog does not list cannot push the figure past the total. */
const collectedCount = computed(
  () => catalog.value.filter(breed => collected.value.has(breed)).length
)

const tipEl = useTemplateRef('tipEl')
const tip = ref(null)

const TIP_GAP = 10

/* Sits to the right of the dot rather than above it: the meter lives at the
   left edge of the page, where a centred tooltip runs off screen. */
async function showTip (breed, event) {
  const dot = event.currentTarget.getBoundingClientRect()

  tip.value = {
    breed,
    collected: collected.value.has(breed),
    left: dot.right + TIP_GAP,
    top: dot.top + dot.height / 2
  }

  await nextTick()
  if (!tipEl.value || !tip.value) return

  // Flip to the other side when it would run past the window.
  const width = tipEl.value.offsetWidth
  if (tip.value.left + width > window.innerWidth - 8) {
    tip.value = { ...tip.value, left: dot.left - TIP_GAP - width }
  }
}

function hideTip () {
  tip.value = null
}
</script>

<style scoped>
.breed-progress {
  margin-top: var(--space-6);
}

.breed-progress-label {
  margin: 0;
  color: var(--color-green-dark);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.breed-progress-figure {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin: var(--space-1) 0 var(--space-3);
}

.breed-progress-count {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 1rem + 2vw, 2.5rem);
  line-height: 1;
  color: var(--color-green-text);
}

.breed-progress-total {
  color: var(--color-green-dark);
  font-size: var(--text-xs);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.breed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9px, 1fr));
  gap: 4px;
}

/* The track: the same hue as the marks, dropped to a tint, so the meter
   reads as one scale rather than two colours. */
.breed-dot {
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: rgb(18 131 109 / 16%);
  transition: transform 0.15s ease;
}

/* A 9px mark is a poor target for a cursor, so the hit area is grown past
   the dot without disturbing the grid. */
.breed-dot::after {
  content: "";
  position: absolute;
  inset: -3px;
}

.breed-dot.collected {
  background-color: var(--color-green-plate);
}

.breed-dot:hover {
  transform: scale(1.5);
}

@media only screen and (max-width: 860px) {
  .breed-progress {
    max-width: 18rem;
    margin: var(--space-5) auto 0;
  }

  .breed-progress-figure {
    justify-content: center;
  }

  .breed-progress-label {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .breed-dot {
    transition: none;
  }

  .breed-dot:hover {
    transform: none;
  }
}
</style>

<!-- The tooltip is teleported to the body, so it is out of this
     component's scope and styled globally. -->
<style>
.breed-tip {
  position: fixed;
  z-index: 80;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background-color: var(--color-green-dark);
  color: var(--color-surface);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
}

.breed-tip-state {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.75;
}

.breed-tip.collected .breed-tip-state {
  color: var(--color-green);
  opacity: 1;
}
</style>

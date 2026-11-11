<template>
  <button class="primary reel-trigger" @click="open">
    <span aria-hidden="true">&#9654;</span> Play the reel
  </button>

  <dialog
    ref="dialogEl"
    class="reel"
    aria-label="Kennel reel"
    @close="stop"
    @click="closeOnBackdrop"
  >
    <div v-if="!ready" class="reel-loading">Rounding up the pack...</div>

    <template v-else>
      <ol class="reel-progress" aria-hidden="true">
        <li
          v-for="(dog, i) in dogs"
          :key="dog.id"
          class="reel-progress-step"
          :class="{ done: i < index, current: i === index }"
        />
      </ol>

      <!-- Title card -->
      <div v-if="index < 0" class="reel-card reel-title">
        <p class="reel-kicker">My cyber kennel</p>
        <p class="reel-tally">{{ dogs.length }}</p>
        <p class="reel-sub">
          {{ dogs.length === 1 ? 'pooch' : 'pooches' }} ·
          {{ breedCount }} {{ breedCount === 1 ? 'breed' : 'breeds' }}
        </p>
      </div>

      <!-- One dog -->
      <figure v-else-if="current" :key="current.id" class="reel-card reel-slide">
        <div
          class="reel-photo"
          :style="{ backgroundImage: `url('${current.image}')` }"
        />
        <PupDecor :count="26" theme="dark" animated />

        <figcaption class="reel-caption">
          <p class="reel-name">{{ current.name }}</p>
          <p v-if="current.breed" class="reel-breed">{{ current.breed }}</p>
        </figcaption>
      </figure>

      <!-- End card -->
      <div v-else class="reel-card reel-title">
        <p class="reel-kicker">That's the pack</p>
        <p class="reel-sub reel-end-sub">Every one of them named by you.</p>
        <button class="primary" @click="restart">Play it again</button>
      </div>

      <button class="reel-close" @click="dialogEl.close()">Close</button>

      <Confetti v-if="index >= dogs.length" :origin="{ x: 0.5, y: 0.45 }" />
    </template>
  </dialog>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, useTemplateRef } from 'vue'
import Confetti from './Confetti.vue'
import PupDecor from './PupDecor.vue'

const props = defineProps({
  dogs: {
    type: Array,
    default: () => []
  }
})

const SLIDE_MS = 2400
const TITLE_MS = 1800

const dialogEl = useTemplateRef('dialogEl')

// -1 is the title card, dogs.length is the end card.
const index = ref(-1)
const ready = ref(false)

const EXIT_MS = 320

let timer = null
let teardownTimer = null

const current = computed(() => props.dogs[index.value] ?? null)

const breedCount = computed(
  () => new Set(props.dogs.map(dog => dog.breed).filter(Boolean)).size
)

/* Decode every photo up front: a montage that stalls on a slow image is
   worse than one that takes a moment to start. */
async function preloadAll () {
  await Promise.allSettled(
    props.dogs.map(dog => {
      const image = new Image()
      image.src = dog.image
      return image.decode()
    })
  )
}

function advance () {
  clearTimeout(timer)

  if (index.value >= props.dogs.length) return

  timer = setTimeout(() => {
    index.value += 1
    advance()
  }, index.value < 0 ? TITLE_MS : SLIDE_MS)
}

async function open () {
  clearTimeout(teardownTimer)
  index.value = -1
  ready.value = false
  dialogEl.value.showModal()

  await preloadAll()

  // Closed again while the photos were loading.
  if (!dialogEl.value?.open) return

  ready.value = true
  advance()
}

function restart () {
  index.value = -1
  advance()
}

function stop () {
  clearTimeout(timer)
  timer = null

  /* A closed dialog still renders its contents, so without this the last
     slide and its decorations stay in the document. Held until the dialog
     has animated out, or the slide blinks away before the fade. */
  clearTimeout(teardownTimer)
  teardownTimer = setTimeout(() => {
    ready.value = false
    index.value = -1
  }, EXIT_MS)
}

function closeOnBackdrop (event) {
  if (event.target === dialogEl.value) dialogEl.value.close()
}

onBeforeUnmount(() => {
  clearTimeout(timer)
  clearTimeout(teardownTimer)
})
</script>

<style scoped>
.reel-trigger {
  margin-top: var(--space-3);
}

.reel {
  width: 100vw;
  max-width: none;
  height: 100vh;
  max-height: none;
  padding: 0;
  border: 0;
  overflow: hidden;
  background-color: #0b3b32;
  color: var(--color-surface);

  /* Opens like a house light going down rather than appearing all at once.
     allow-discrete keeps display and overlay alive for the way out. */
  opacity: 0;
  transform: scale(1.04);
  transition:
    opacity 260ms ease,
    transform 320ms cubic-bezier(0.2, 0.8, 0.3, 1),
    overlay 320ms allow-discrete,
    display 320ms allow-discrete;
}

.reel[open] {
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  .reel[open] {
    opacity: 0;
    transform: scale(1.04);
  }
}

.reel::backdrop {
  background-color: rgb(11 59 50 / 0%);
  transition:
    background-color 260ms ease,
    overlay 320ms allow-discrete,
    display 320ms allow-discrete;
}

.reel[open]::backdrop {
  background-color: rgb(11 59 50 / 90%);
}

@starting-style {
  .reel[open]::backdrop {
    background-color: rgb(11 59 50 / 0%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reel,
  .reel::backdrop {
    transition-duration: 1ms;
  }

  .reel {
    transform: none;
  }
}

.reel-loading,
.reel-card {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: var(--space-3);
  width: 100%;
  height: 100%;
  /* The slide is a <figure>, which carries a 16px/40px UA margin that
     pushed it off the dialog and overflowed the bottom. */
  margin: 0;
  text-align: center;
}

.reel-kicker {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: bold;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.75;
}

.reel-tally {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(4rem, 18vw, 10rem);
  line-height: 0.9;
  color: var(--color-green);
}

.reel-sub {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
}

.reel-end-sub {
  max-width: 22rem;
}

/* The slide itself. The photo drifts rather than sitting still, which is
   what makes a sequence of stills read as a reel. */
.reel-slide {
  position: relative;
  gap: 0;
  padding: 0;
}

.reel-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  animation: reel-drift 6s ease-out both;
}

@keyframes reel-drift {
  from { transform: scale(1.02); }
  to { transform: scale(1.14); }
}

/* Pinned to the bottom edge: the card centres its content, which left the
   caption floating in the middle of the photo. */
.reel-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: var(--space-7) var(--space-5) var(--space-6);
  background: linear-gradient(transparent, rgb(11 59 50 / 85%) 45%);
  animation: slow-appear 0.5s both;
}

.reel-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 7vw, 4rem);
  line-height: 1;
}

.reel-breed {
  margin: var(--space-3) 0 0;
  font-size: var(--text-xs);
  font-weight: bold;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-green);
}

.reel-progress {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  z-index: 2;
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reel-progress-step {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background-color: rgb(255 255 255 / 25%);
}

.reel-progress-step.done {
  background-color: var(--color-green);
}

.reel-progress-step.current {
  background-color: var(--color-surface);
}

/* .primary is a dark fill, which disappears against the reel's dark
   surface. Inverted here. */
.reel .primary {
  background-color: var(--color-green);
  color: #0b3b32;
}

.reel .primary:hover {
  background-color: var(--color-surface);
}

.reel-close {
  position: absolute;
  top: var(--space-5);
  right: var(--space-4);
  z-index: 2;
  margin: 0;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background-color: rgb(255 255 255 / 15%);
  color: var(--color-surface);
  font-size: var(--text-xs);
  font-weight: bold;
}

.reel-close:hover {
  background-color: rgb(255 255 255 / 28%);
}

@media (prefers-reduced-motion: reduce) {
  .reel-photo,
  .reel-caption {
    animation: none;
  }
}
</style>

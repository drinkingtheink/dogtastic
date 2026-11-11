<template>
  <div>
    <h3 class="panel-eyebrow">{{ TITLE }}</h3>

    <div class="img-stage">
      <div
        ref="portraitEl"
        class="dog-img"
        :class="{ 'in-process': loading, 'dog-img-failed': imageFailed, celebrating: selectedName }"
        :style="portraitStyle"
      >
        <p v-if="imageFailed" class="dog-img-fallback">
          This pooch would not sit for a portrait
        </p>
      </div>

      <template v-if="selectedName">
        <span
          v-for="ring in 3"
          :key="ring"
          class="shockwave"
          :style="{ animationDelay: `${(ring - 1) * 130}ms` }"
        />
      </template>

      <Transition name="fade">
        <Bubbles v-if="selectedName" />
      </Transition>

      <Transition name="fade">
        <p v-if="selectedName" class="dog-selected-name">
          Welcome, {{ selectedName }}!
        </p>
      </Transition>

      <Transition name="fade">
        <p v-if="breed" class="dog-breed">{{ breed }}</p>
      </Transition>
    </div>

    <Confetti
      v-if="confettiOn"
      :origin="confettiOrigin"
      @done="confettiOn = false"
    />

    <!-- Each button sits next to what it refreshes: the dog above,
         the names below. -->
    <div class="dog-actions">
      <button class="primary" @click="fetchDog">
        New Dog, Please
      </button>
      <button class="primary" @click="drawNames">
        More Names, Please
      </button>
    </div>

    <h4>{{ PROMPT }}</h4>

    <form class="custom-name" @submit.prevent="claimCustomName">
      <label class="custom-name-label" for="custom-name-input">
        Give them a name
      </label>

      <div ref="customRowEl" class="custom-name-row">
        <input
          id="custom-name-input"
          v-model="customName"
          type="text"
          class="custom-name-input"
          :maxlength="MAX_NAME_LENGTH"
          placeholder="A name of your own"
          autocomplete="off"
          :disabled="!!selectedName"
        >
        <button type="submit" class="primary" :disabled="!canNameDog">
          Name This Dog
        </button>
      </div>
    </form>

    <p class="gallery-lead">...or pick one of these</p>

    <p v-if="namesLoading && !names.length" class="names-loading">
      Rounding up some names...
    </p>

    <div class="name-gallery" :class="{ prevent: selectedName }">
      <TransitionGroup tag="div" class="name-tg" name="list">
        <button
          v-for="name in names"
          :key="name"
          class="name"
          @click="claimDog(name, $event.currentTarget)"
        >
          {{ name }}
        </button>
      </TransitionGroup>
    </div>

    <p v-if="loading">Fetching...</p>
    <p v-if="error" class="dog-error">
      The Dog API is not answering right now. Try again?
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import Bubbles from './Bubbles.vue'
import Confetti from './Confetti.vue'
import { useDogApi } from '../composables/useDogApi'
import { useNames } from '../composables/useNames'
import { useImageStatus } from '../composables/useImageStatus'

const TITLE = 'Name that Pooch'
const PROMPT = 'What name is worthy of this magnificent creature?'

const CELEBRATION_MS = 1000
const MAX_NAME_LENGTH = 40
const BANNER_CLEAR_MS = CELEBRATION_MS + 900

const emit = defineEmits(['newDogForKennel'])

const { image, breed, loading, error, fetchDog } = useDogApi()
const { status: imageStatus } = useImageStatus(image)
const imageFailed = computed(() => imageStatus.value === 'error')

/* Returns an empty object rather than `background-image: none` when the
   photo is missing: an inline style would outrank the stylesheet and stop
   .dog-img-failed painting its gradient. */
const portraitStyle = computed(() =>
  imageFailed.value || !image.value ? {} : { backgroundImage: `url('${image.value}')` }
)
const { names, loading: namesLoading, drawNames, removeName } = useNames()

const selectedName = ref(null)
const customName = ref('')

const portraitEl = useTemplateRef('portraitEl')
const customRowEl = useTemplateRef('customRowEl')
const confettiOn = ref(false)
const confettiOrigin = ref({ x: 0.5, y: 0.45 })

/* Blocked while a celebration is already running, so a dog cannot be
   named twice before the next one arrives. */
const canNameDog = computed(
  () => customName.value.trim().length > 0 && !selectedName.value
)

const timers = []

function later (fn, ms) {
  timers.push(setTimeout(fn, ms))
}

/** Where the burst should come from, as viewport fractions. */
function portraitCentre () {
  const box = portraitEl.value?.getBoundingClientRect()
  if (!box) return { x: 0.5, y: 0.45 }

  return {
    x: (box.left + box.width / 2) / window.innerWidth,
    y: (box.top + box.height / 2) / window.innerHeight
  }
}

/** Centre of an element in viewport pixels, for the name's flight path. */
function centreOf (el) {
  const box = el?.getBoundingClientRect()
  if (!box) return null
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

function claimDog (name, originEl) {
  selectedName.value = name
  removeName(name)

  confettiOrigin.value = portraitCentre()
  confettiOn.value = true

  emit('newDogForKennel', {
    name,
    image: image.value,
    breed: breed.value,
    // Where the name should launch from on its way to the kennel.
    origin: centreOf(originEl)
  })

  later(fetchDog, CELEBRATION_MS)
  later(() => { selectedName.value = null }, BANNER_CLEAR_MS)
}

function claimCustomName () {
  if (!canNameDog.value) return

  const name = customName.value.trim()
  customName.value = ''
  claimDog(name, customRowEl.value)
}

// Refill the gallery once it has been emptied.
watch(names, current => {
  if (current.length === 0) drawNames()
})

onMounted(() => {
  fetchDog()
  drawNames()
})

// The original left these timers running after teardown.
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<style scoped>
/* The naming controls share one measure so they read as a single group
   instead of three different widths stacked up. */
.name-gallery {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  max-width: 36rem;
  margin: 0 auto;
  opacity: 1;
  transition: all 0.2s;
}

.name-gallery.prevent {
  opacity: 0.6;
  pointer-events: none;
}

.name-tg {
  width: 100%;
}

.name-tg button {
  display: inline-block;
}

/* An eyebrow rather than a billboard: the portrait is the hero here, and
   this only needs to label the column. */
.panel-eyebrow {
  margin-bottom: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: bold;
  letter-spacing: 0.14em;
  color: var(--color-green-dark);
}

.dog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  /* Clears the portrait's ring and the badge straddling its edge. */
  margin-top: var(--space-5);
}

.dog-actions button {
  margin: 0;
}

/* Breathing room between the refresh row and the names it sits between. */
.dog-actions + h4 {
  margin-top: var(--space-4);
}

/* Sits on the portrait's lower edge like a collar tag, rather than
   taking a row of its own underneath. */
.dog-breed {
  position: absolute;
  left: 50%;
  bottom: -0.6rem;
  transform: translateX(-50%);
  z-index: 2;
  margin: 0;
  width: max-content;
  max-width: 85%;
  box-shadow: var(--shadow-md);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-pill);
  background-color: var(--color-green-plate);
  color: var(--color-surface);
  font-size: var(--text-xs);
  font-weight: bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.names-loading {
  color: var(--color-green-dark);
  font-size: var(--text-sm);
}

.dog-img {
  height: var(--dog-portrait-size);
  width: var(--dog-portrait-size);
  border-radius: 50%;
  background-color: rgb(255 255 255 / 50%);
  background-size: cover;
  background-position: center;
  margin: 0 auto;
  box-shadow:
    0 0 0 5px var(--color-surface),
    0 0 0 10px var(--color-green),
    var(--shadow-lg);
  transition: opacity 0.25s ease, box-shadow 0.25s ease;
}

.dog-img-failed {
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background:
    linear-gradient(140deg, var(--color-green-plate), var(--color-green-dark));
}

.dog-img-fallback {
  margin: 0;
  color: var(--color-surface);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
}

.dog-img.in-process {
  opacity: 0.35;
}

/* The dog reacts to being named: a quick squash-and-stretch overshoot. */
.dog-img.celebrating {
  animation: portrait-pop 760ms cubic-bezier(0.2, 1.7, 0.35, 1);
}

@keyframes portrait-pop {
  0% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.11) rotate(-2deg); }
  55% { transform: scale(0.95) rotate(1.5deg); }
  78% { transform: scale(1.03) rotate(-0.5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

/* Rings pushing outward from the portrait, staggered so they read as a
   pulse rather than one hoop. */
.shockwave {
  position: absolute;
  top: 0;
  left: 50%;
  width: var(--dog-portrait-size);
  height: var(--dog-portrait-size);
  border: 5px solid var(--color-green);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  animation: shockwave 1s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}

@keyframes shockwave {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
    border-width: 5px;
  }

  100% {
    transform: translateX(-50%) scale(2.2);
    opacity: 0;
    border-width: 1px;
  }
}

.img-stage {
  position: relative;
}

.dog-selected-name {
  position: absolute;
  /* It is a <p>, so without this its default 1em top margin offsets the
     centring by a fifth of its own font size. */
  margin: 0;
  padding: var(--space-3) var(--space-5);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: max-content;
  max-width: 90%;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-lg);
  background-color: var(--color-green-plate);
  color: var(--color-surface);
  font-weight: bold;
  font-size: var(--text-lg);
  overflow: hidden;
  animation: stamp 620ms cubic-bezier(0.16, 1.6, 0.4, 1);
}

/* Lands like a rubber stamp: oversized and tilted, overshooting on the
   way down. */
@keyframes stamp {
  0% {
    transform: translate(-50%, -50%) scale(2.6) rotate(-14deg);
    opacity: 0;
  }

  55% {
    transform: translate(-50%, -50%) scale(0.9) rotate(3deg);
    opacity: 1;
  }

  75% {
    transform: translate(-50%, -50%) scale(1.06) rotate(-1.5deg);
  }

  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

/* A highlight sweeping across the banner once it has settled. */
.dog-selected-name::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 35%,
    rgb(255 255 255 / 55%) 50%,
    transparent 65%
  );
  background-size: 250% 100%;
  animation: shine 1s ease-out 320ms;
}

@keyframes shine {
  from { background-position: 160% 0; }
  to { background-position: -160% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .dog-img.celebrating,
  .shockwave,
  .dog-selected-name,
  .dog-selected-name::after {
    animation: none;
  }

  .shockwave {
    display: none;
  }
}

.custom-name {
  margin: var(--space-4) auto var(--space-3);
  max-width: 28rem;
  padding: 0 var(--space-4);
}

.gallery-lead {
  margin: 0 0 var(--space-2);
  color: var(--color-green-dark);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: bold;
}

.custom-name-label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-green-dark);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: bold;
}

.custom-name-row {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.custom-name-input {
  flex: 1 1 auto;
  min-width: 0;
  border: 2px solid rgb(18 131 109 / 25%);
  border-radius: var(--radius-pill);
  padding: var(--space-2) var(--space-4);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-body);
  font-size: var(--text-base);
  background-color: var(--color-surface);
  color: var(--color-ink);
}

.custom-name-input:focus-visible {
  outline: 3px solid var(--color-green-dark);
  outline-offset: 1px;
}

.custom-name-input:disabled {
  opacity: 0.5;
}

.custom-name .primary {
  flex: 0 0 auto;
  margin: 0;
  white-space: nowrap;
}

.custom-name .primary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dog-error {
  color: var(--color-green-dark);
  font-size: var(--text-sm);
}

.name {
  border: 2px solid rgb(18 131 109 / 20%);
  border-radius: var(--radius-pill);
  padding: var(--space-2) var(--space-4);
  margin: var(--space-1);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-green-dark);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
  animation: slow-appear 0.5s;
}

.name:hover {
  cursor: pointer;
  background-color: var(--color-green-plate);
  border-color: var(--color-green-plate);
  color: var(--color-surface);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

</style>

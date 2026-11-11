<template>
  <div>
    <h3 class="panel-eyebrow">{{ TITLE }}</h3>

    <div class="portrait-frame">
      <div
        ref="portraitEl"
        class="dog-img"
        :class="{ swapping: loading && image, celebrating: selectedName }"
        :style="portraitStyle"
      >
        <div v-if="!image && !error" class="dog-img-skeleton" aria-hidden="true" />

        <div v-else-if="error && !image" class="dog-img-error">
          <p>This pooch would not sit for a portrait.</p>
          <button class="primary" @click="fetchDog">Try again</button>
        </div>
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
        <p v-if="selectedName" class="dog-selected-name">
          Welcome, {{ selectedName }}!
        </p>
      </Transition>

      <Transition name="fade">
        <p v-if="breed" class="dog-breed">{{ breed }}</p>
      </Transition>

      <button class="primary new-dog" @click="fetchDog">
        <span aria-hidden="true">&#8635;</span> New Dog
      </button>
    </div>

    <Confetti
      v-if="confettiOn"
      :origin="confettiOrigin"
      @done="confettiOn = false"
    />

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

        <button
          key="more-names"
          class="name more-names"
          @click="drawNames"
        >
          <span aria-hidden="true">&#8635;</span> More names
        </button>
      </TransitionGroup>
    </div>

    <p v-if="error && image" class="dog-error">
      Could not fetch a new dog just then. The one above is still yours.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import Confetti from './Confetti.vue'
import { useDogApi } from '../composables/useDogApi'
import { useNames } from '../composables/useNames'

const TITLE = 'Name that Pooch'
const PROMPT = 'What name is worthy of this magnificent creature?'

const CELEBRATION_MS = 1000
const MAX_NAME_LENGTH = 40
const BANNER_CLEAR_MS = CELEBRATION_MS + 900

const emit = defineEmits(['newDogForKennel'])

const { image, breed, loading, error, fetchDog, prefetchNext } = useDogApi()

/* An empty object rather than `background-image: none`, because an inline
   style outranks the stylesheet and would stop the skeleton and error
   states painting their backgrounds. */
const portraitStyle = computed(() =>
  image.value ? { backgroundImage: `url('${image.value}')` } : {}
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

  // Fetch and decode the next dog now, so the swap when the celebration
  // ends has nothing left to wait for.
  prefetchNext()

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

/* Rides on the portrait's top-right shoulder instead of taking a row of
   its own. Dark on white text, so it stays legible over any photo. */
.new-dog {
  position: absolute;
  top: 4%;
  right: -5%;
  z-index: 3;
  margin: 0;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  box-shadow: var(--shadow-lg);
}

.portrait-frame ~ h4 {
  margin-top: var(--space-5);
}

/* Reads as an action rather than a name: dashed, and it does not fill in
   on hover the way the names do. */
.more-names {
  border-style: dashed;
  border-color: rgb(18 131 109 / 45%);
  background-color: transparent;
  box-shadow: none;
  font-weight: bold;
  font-size: var(--text-sm);
}

.more-names:hover {
  background-color: rgb(18 131 109 / 10%);
  border-color: var(--color-green-plate);
  color: var(--color-green-dark);
  transform: translateY(-2px);
  box-shadow: none;
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
  display: block;
  /* A rounded square rather than a circle: a circle discarded about 43% of
     each photo, since most of them are landscape. Proportional so the
     corners keep their shape as the portrait scales, and distinct from the
     kennel cards, which are 3:2 at a much tighter radius. */
  border-radius: var(--portrait-radius);
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

/* First load only. Once there is a dog on screen it stays put through the
   next fetch, so there is nothing to cover. */
.dog-img-skeleton {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background:
    linear-gradient(
      100deg,
      rgb(18 131 109 / 8%) 30%,
      rgb(18 131 109 / 18%) 50%,
      rgb(18 131 109 / 8%) 70%
    );
  background-size: 300% 100%;
  animation: portrait-shimmer 1.4s ease-in-out infinite;
}

@keyframes portrait-shimmer {
  from { background-position: 150% 0; }
  to { background-position: -150% 0; }
}

.dog-img-error {
  display: grid;
  place-items: center;
  gap: var(--space-4);
  width: 100%;
  height: 100%;
  padding: var(--space-6);
  border-radius: inherit;
  text-align: center;
  background:
    linear-gradient(140deg, var(--color-green-plate), var(--color-green-dark));
  color: var(--color-surface);
}

.dog-img-error p {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
}

/* A dip rather than a blank: the previous dog is still worth looking at
   while the next one loads. */
.dog-img.swapping {
  opacity: 0.75;
}

@media (prefers-reduced-motion: reduce) {
  .dog-img-skeleton {
    animation: none;
  }
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
  inset: 0;
  border: 5px solid var(--color-green);
  border-radius: var(--portrait-radius);
  pointer-events: none;
  opacity: 0;
  animation: shockwave 1s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}

@keyframes shockwave {
  0% {
    transform: scale(1);
    opacity: 0.8;
    border-width: 5px;
  }

  100% {
    transform: scale(2.2);
    opacity: 0;
    border-width: 1px;
  }
}

/* Anchors the chrome that belongs to the portrait: the badge, the floating
   button, the banner and the rings. It shrink-wraps rather than restating
   --dog-portrait-size, so there is one source of truth for how big the
   portrait is and the two cannot drift apart.
   Anything meant to cover the window - the confetti canvas - must stay
   OUTSIDE this element, or it inherits a box the size of the dog. */
.portrait-frame {
  position: relative;
  width: fit-content;
  margin: 0 auto;
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

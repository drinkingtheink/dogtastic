<template>
  <div>
    <h3>{{ TITLE }}</h3>

    <button class="primary fetch-dogs" @click="fetchDog">
      New Dog, Please
    </button>

    <div class="img-stage">
      <div
        class="dog-img"
        :class="{ 'in-process': loading }"
        :style="{ backgroundImage: image ? `url('${image}')` : 'none' }"
      />

      <Transition name="fade">
        <Bubbles v-if="selectedName" />
      </Transition>

      <Transition name="fade">
        <p v-if="selectedName" class="dog-selected-name">
          Welcome, {{ selectedName }}!
        </p>
      </Transition>
    </div>

    <Transition name="fade">
      <p v-if="breed" class="dog-breed">{{ breed }}</p>
    </Transition>

    <h4>{{ PROMPT }}</h4>

    <p v-if="namesLoading && !names.length" class="names-loading">
      Rounding up some names...
    </p>

    <div class="name-gallery" :class="{ prevent: selectedName }">
      <TransitionGroup tag="div" class="name-tg" name="list">
        <button
          v-for="name in names"
          :key="name"
          class="name"
          @click="claimDog(name)"
        >
          {{ name }}
        </button>
      </TransitionGroup>
    </div>

    <button class="primary" @click="drawNames">
      More Names, Please
    </button>

    <form class="custom-name" @submit.prevent="claimCustomName">
      <label class="custom-name-label" for="custom-name-input">
        ...or christen them yourself
      </label>

      <div class="custom-name-row">
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

    <p v-if="loading">Fetching...</p>
    <p v-if="error" class="dog-error">
      The Dog API is not answering right now. Try again?
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Bubbles from './Bubbles.vue'
import { useDogApi } from '../composables/useDogApi'
import { useNames } from '../composables/useNames'

const TITLE = 'Name that Pooch'
const PROMPT = 'What name is worthy of this magnificent creature?'

const CELEBRATION_MS = 1000
const MAX_NAME_LENGTH = 40
const BANNER_CLEAR_MS = CELEBRATION_MS + 900

const emit = defineEmits(['newDogForKennel'])

const { image, breed, loading, error, fetchDog } = useDogApi()
const { names, loading: namesLoading, drawNames, removeName } = useNames()

const selectedName = ref(null)
const customName = ref('')

/* Blocked while a celebration is already running, so a dog cannot be
   named twice before the next one arrives. */
const canNameDog = computed(
  () => customName.value.trim().length > 0 && !selectedName.value
)

const timers = []

function later (fn, ms) {
  timers.push(setTimeout(fn, ms))
}

function claimDog (name) {
  selectedName.value = name
  removeName(name)

  emit('newDogForKennel', { name, image: image.value, breed: breed.value })

  later(fetchDog, CELEBRATION_MS)
  later(() => { selectedName.value = null }, BANNER_CLEAR_MS)
}

function claimCustomName () {
  if (!canNameDog.value) return

  const name = customName.value.trim()
  customName.value = ''
  claimDog(name)
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
.name-gallery {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
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

.fetch-dogs {
  margin-bottom: 0.25rem;
}

.dog-breed {
  display: inline-block;
  margin: var(--space-3) auto 0;
  padding: var(--space-1) var(--space-4);
  border-radius: 999px;
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
  transition: all 0.2s;
  border-radius: 50%;
  border: 4px solid var(--color-green);
  background-color: rgb(255 255 255 / 50%);
  background-size: cover;
  background-position: center;
  margin: 0 auto;
}

.dog-img.in-process {
  opacity: 0.25;
  border-color: transparent;
}

.img-stage {
  position: relative;
}

.dog-selected-name {
  position: absolute;
  padding: 1rem 0;
  left: 0;
  right: 0;
  top: 12rem;
  text-align: center;
  width: 100%;
  background-color: var(--color-green-plate);
  color: var(--color-surface);
  font-weight: bold;
  font-size: var(--text-lg);
}

.custom-name {
  margin: 1.25rem auto 0;
  max-width: 24rem;
  padding: 0 1rem;
}

.custom-name-label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--color-green-dark);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: bold;
}

.custom-name-row {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.custom-name-input {
  flex: 1 1 auto;
  min-width: 0;
  border: 3px solid var(--color-green-dark);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.6rem;
  font-family: var(--font-body);
  font-size: var(--text-base);
  background-color: var(--color-surface);
  color: var(--color-ink);
}

.custom-name-input:focus-visible {
  outline: 3px solid var(--color-green);
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
  border: 3px solid var(--color-green-dark);
  padding: var(--space-2) var(--space-3);
  margin: var(--space-1);
  transition: all 0.2s;
  font-size: var(--text-base);
  opacity: 1;
  animation: slow-appear 0.5s;
  background-color: var(--color-surface);
}

.name:hover {
  cursor: pointer;
  background-color: var(--color-contrast);
  color: var(--color-surface);
  border-color: var(--color-green-dark);
}

@media only screen and (max-width: 1300px) {
  .dog-selected-name {
    top: 6rem;
  }
}
</style>

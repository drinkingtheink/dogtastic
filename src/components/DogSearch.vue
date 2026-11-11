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

    <p v-if="loading">Fetching...</p>
    <p v-if="error" class="dog-error">
      The Dog API is not answering right now. Try again?
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Bubbles from './Bubbles.vue'
import { useDogApi } from '../composables/useDogApi'
import { useNames } from '../composables/useNames'

const TITLE = 'Name that Pooch'
const PROMPT = 'What name is worthy of this magnificent creature?'

const CELEBRATION_MS = 1000
const BANNER_CLEAR_MS = CELEBRATION_MS + 900

const emit = defineEmits(['newDogForKennel'])

const { image, breed, loading, error, fetchDog } = useDogApi()
const { names, loading: namesLoading, drawNames, removeName } = useNames()

const selectedName = ref(null)

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
  margin: 0.6rem auto 0;
  padding: 0.2rem 0.9rem;
  border-radius: 999px;
  background-color: var(--color-green);
  color: var(--color-surface);
  font-size: 75%;
  font-weight: bold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.names-loading {
  color: var(--color-green-dark);
  font-size: 80%;
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
  background-color: var(--color-green);
  color: var(--color-surface);
  font-weight: bold;
  font-size: 130%;
}

.dog-error {
  color: var(--color-green-dark);
  font-size: 80%;
}

.name {
  border: 3px solid var(--color-green-dark);
  padding: 0.25rem 0.5rem;
  margin: 0.25rem;
  transition: all 0.2s;
  font-size: 120%;
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

  .name {
    font-size: 100%;
  }
}

@media only screen and (max-width: 800px) {
  .name {
    font-size: 90%;
  }
}
</style>

<template>
  <div ref="rootEl">
    <!-- Sticky, because the roster scrolls inside this panel: left at the
         foot of the list these controls scrolled away with it. -->
    <header class="kennel-header">
      <h3 class="kennel-count-display">
        Caring for {{ dogCount }} {{ dogCount === 1 ? "pooch" : "pooches" }}
      </h3>

      <!-- Fades rather than vanishing: dropping it outright yanks the card
           grid up mid-exit, which reads as the cards jumping. -->
      <Transition name="fade">
        <p v-if="breedCount > 0" class="kennel-breed-count">
          {{ breedCount }} {{ breedCount === 1 ? "breed" : "breeds" }} collected
        </p>
      </Transition>

      <Transition name="fade">
        <div v-if="dogCount > 0" class="kennel-actions">
          <KennelReel :dogs="dogs" />

          <button class="utility" :disabled="saving" @click="saveSheet">
            {{ saving ? saveLabel : "Save Kennel Poster" }}
          </button>

          <button class="clear-kennel utility" @click="emit('clearKennel')">
            Empty Kennel
          </button>
        </div>
      </Transition>
      <p v-if="saveNote" class="kennel-save-note">{{ saveNote }}</p>
    </header>

    <TransitionGroup
      tag="section"
      name="card"
      class="dog-display"
      @before-leave="pinLeavingCard"
    >
      <DogCard
        v-for="dog in dogs"
        :key="dog.id"
        :dog="dog"
        @remove-dog-from-kennel="emit('removeDogFromKennel', $event)"
        @reposition-dog="emit('repositionDog', $event)"
        @move-motif="emit('moveMotif', $event)"
      />
    </TransitionGroup>

    <Transition name="fade">
      <div v-if="dogCount === 0" class="empty-kennel">
        <p>{{ EMPTY_MESSAGE }}</p>
        <svg
          class="dog-illo"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 269 239"
          aria-hidden="true"
        >
          <defs>
            <!-- The artwork is referenced twice below, so it lives here once. -->
            <g id="dogSilhouette"><path d="M90.53,219.63l-12.65-1.85c.89-4.64,1.82-8.65,6.64-10.46.93-.35,1.75-2.51,1.67-3.77-1.1-17.52-2-35.06-3.82-52.52-.43-4.27-3.42-8.41-5.72-12.32-2.59-4.42-5.91-8.41-8.56-12.79a19.7,19.7,0,0,1-2.38-7c-.88-5.47-1.39-11-2.1-16.91,6.44-4,13.86-8,20.67-12.9s13-10.65,19.41-15.93c12.75,3.6,25.72,9,39.14,10.61,16.84,2,34,.73,51.1.87a6.66,6.66,0,0,0,1-.11c8.88-.88,9.13-1.36,8.87-10.65A87.91,87.91,0,0,0,189,27.19c-2.55-3.89-4.4-8.24-6.57-12.38L184,13.24c1.74.78,3.85,1.17,5.15,2.41,19.15,18.29,32.13,39.42,31,67.15a182.45,182.45,0,0,0,.79,22.78,9.63,9.63,0,0,0,3.65,6c6.77,4.94,9.57,11.31,9.45,19.64-.14,10.11.46,20.25,4.85,29.64.88,1.91,2.91,3.25,4.14,5a24.52,24.52,0,0,1,3.46,6.21c2.82,9,5.36,18,8,27.06.74,2.5,1.55,5,2.33,7.47v8c-5.34,1.08-10.65,2.83-16,3-4.39.18-4.93-2-2.21-5.75,1.62-2.25,4.12-4.28,4.72-6.77,2.29-9.53-2.83-20.15-11.19-25.88q-12.09-8.26-23.55-17.43a38.83,38.83,0,0,1-8.87-9.88c-5.49-9.07-10.06-11.51-20.5-9.61-2.12.38-4.21.89-6.33,1.28-20.16,3.68-40.32,7.45-60.51,11-8.31,1.46-8.22,1.29-8.89,10-.9,11.73-1.64,23.5-3.33,35.13-1,6.76-3.71,13.27-5.65,19.89Z"/><path d="M50.83,12.16c2.19,2.14,4.5,4.16,6.54,6.43Q66,28.15,74.44,37.87c7.69,8.82,15.32,17.69,23.21,26.82C86.76,78.2,73.24,86.22,58.87,93.93c-3-6.48-6-12.53-8.69-18.72-1.61-3.72-4-5.06-8.1-5a52.62,52.62,0,0,1-13.81-1.13C18.85,66.71,16,62,15.16,48.81c4.73-.79,9.62-1.33,14.34-2.52a14.64,14.64,0,0,0,6-3.67,68.27,68.27,0,0,0,8-8.71A17.54,17.54,0,0,0,46.57,27c1-4.71,1.41-9.53,2.07-14.3Z"/></g>

            <!-- The tail is not a separate shape in the original: it is part
                 of one continuous filled outline. These two clips cut it out
                 of the body and keep it on its own, so it can rotate. -->
            <clipPath id="dogTailClip">
              <path d="M200 80 L224 80 L200 -12 L164 -12 Z" />
            </clipPath>

            <clipPath id="dogBodyClip">
              <path clip-rule="evenodd" d="M-20 -20 H289 V259 H-20 Z M200 80 L224 80 L200 -12 L164 -12 Z" />
            </clipPath>
          </defs>

          <use href="#dogSilhouette" clip-path="url(#dogBodyClip)" />

          <g class="dog-tail">
            <use href="#dogSilhouette" clip-path="url(#dogTailClip)" />
          </g>
        </svg>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { computed, ref, onBeforeUpdate, useTemplateRef } from "vue"
import DogCard from "./DogCard.vue"
import KennelReel from "./KennelReel.vue"
import { downloadKennel } from "../utils/downloadKennel"

const EMPTY_MESSAGE = "-- There is a sad lack of pooches in your kennel --"

const props = defineProps({
  dogs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["removeDogFromKennel", "clearKennel", "repositionDog", "moveMotif"])

const dogCount = computed(() => props.dogs.length)

const saving = ref(false)
const saveLabel = ref("Saving...")
const saveNote = ref("")

async function saveSheet () {
  saving.value = true
  saveNote.value = ""

  try {
    const result = await downloadKennel(props.dogs, {
      onProgress: (done, total) => { saveLabel.value = `${done} of ${total}...` }
    })

    if (result.omitted > 0) {
      saveNote.value = `Saved the ${result.drawn} most recent; ${result.omitted} would not fit on one sheet.`
    }
  } catch {
    saveNote.value = "Could not build that sheet. Try again?"
  } finally {
    saving.value = false
    saveLabel.value = "Saving..."
  }
}

const breedCount = computed(
  () => new Set(props.dogs.map(dog => dog.breed).filter(Boolean)).size
)

const rootEl = useTemplateRef("rootEl")

/**
 * A leaving card goes position:absolute so the survivors can slide into its
 * place, but an absolute box with no offsets falls back to its static
 * position -- which, when several cards leave at once, collapses them all
 * into a pile. So each card is pinned to where it sat before it detached.
 *
 * The geometry has to be captured here rather than in the leave hook: that
 * hook runs per card, and by the time it reaches the second one the first
 * has already left the flow, so every card would measure the same slot.
 */
const cardGeometry = new WeakMap()

onBeforeUpdate(() => {
  for (const el of rootEl.value?.querySelectorAll(".dog-card") ?? []) {
    cardGeometry.set(el, {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight
    })
  }
})

function pinLeavingCard (el) {
  const geometry = cardGeometry.get(el)
  if (!geometry) return

  el.style.margin = "0"
  el.style.width = `${geometry.width}px`
  el.style.height = `${geometry.height}px`
  el.style.left = `${geometry.left}px`
  el.style.top = `${geometry.top}px`
}
</script>

<style scoped>
/* Text inside the kennel sits on yellow, not white, so it needs the deep
   green. The bright and dark greens both fall under AA against #facc43. */
.kennel-count-display {
  color: var(--color-green-deep);
}

.kennel-breed-count {
  margin: var(--space-1) 0 var(--space-3);
  color: var(--color-green-deep);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: bold;
}

.dog-display {
  /* Cards leaving the kennel are absolutely positioned, so they need this
     as their containing block to keep their size and place while they go. */
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: 0 var(--space-3);
}

.dog-illo {
  max-width: 30%;
  opacity: 0.5;
}

/* Pivots at the base of the tail, in viewBox coordinates. He wags in
   bursts rather than non-stop, so the kennel does not twitch forever. */
.dog-tail {
  transform-box: view-box;
  transform-origin: 211px 80px;
  animation: tail-wag 6s ease-in-out infinite;
}

@keyframes tail-wag {
  0%, 3% { transform: rotate(0deg); }
  6% { transform: rotate(13deg); }
  9% { transform: rotate(-7deg); }
  12% { transform: rotate(13deg); }
  15% { transform: rotate(-7deg); }
  18% { transform: rotate(12deg); }
  21% { transform: rotate(-7deg); }
  24% { transform: rotate(9deg); }
  27% { transform: rotate(-5deg); }
  30%, 100% { transform: rotate(0deg); }
}

@media (prefers-reduced-motion: reduce) {
  .dog-tail {
    animation: none;
  }
}

.kennel-header {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: var(--space-4) var(--space-3) var(--space-3);
  /* Flat fill rather than the panel's pattern: a patterned sticky layer
     has its own background origin and slides out of register with the
     panel behind it as the roster scrolls. */
  background-color: var(--color-yellow-light);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 8px 14px -10px rgb(16 42 36 / 45%);
}

.kennel-save-note {
  margin: var(--space-2) 0 0;
  color: var(--color-green-deep);
  font-size: var(--text-xs);
  font-weight: bold;
}

.kennel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-3);
}

.kennel-actions :deep(button) {
  margin: 0;
}
</style>

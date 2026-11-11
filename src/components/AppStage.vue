<template>
  <main>
    <section class="app-panels">
      <div class="naming-column app-panel">
        <header class="app-header">
          <h1 class="app-headline">
            <span>Dog</span><span>tastic!</span>
          </h1>
          <p class="app-tagline">{{ SUB_HEADLINE }}</p>

          <BrandMark class="brand-mark-slot" />

          <BreedProgress :dogs="roster" />
        </header>

        <DogSearch
          id="dog-search"
          @new-dog-for-kennel="sendToKennel"
        />
      </div>
      <Kennel
        id="kennel"
        ref="kennelRef"
        class="app-panel yellow-bg"
        :class="{ receiving }"
        :dogs="roster"
        @remove-dog-from-kennel="remove"
        @clear-kennel="clear"
      />
    </section>

    <!-- Stacked layouts put the kennel a screen below, so you can name a
         dog and never see where it went. -->
    <a
      v-if="roster.length && !kennelOnScreen"
      class="kennel-jump"
      :class="{ receiving }"
      href="#kennel"
    >
      <strong>{{ roster.length }}</strong>
      in your kennel
    </a>

    <FlyingName
      v-if="flight"
      :key="flight.id"
      :text="flight.name"
      :from="flight.from"
      :to="flight.to"
      @done="landDog"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DogSearch from './DogSearch.vue'
import Kennel from './Kennel.vue'
import FlyingName from './FlyingName.vue'
import BrandMark from './BrandMark.vue'
import BreedProgress from './BreedProgress.vue'
import { useKennel } from '../composables/useKennel'

const SUB_HEADLINE = 'Name and Claim Your Own Cyber Kennel'

// The roster used to live in this component's data(); it now lives in a
// composable that also persists it to localStorage.
const { roster, add, remove, clear } = useKennel()

const kennelRef = ref(null)
const flight = ref(null)
const receiving = ref(false)

const kennelOnScreen = ref(true)

let inFlight = null
let pulseTimer = null
let kennelObserver = null

/**
 * Lobs the name across to the kennel, and only adds the dog once it
 * lands, so the card appears exactly when the name arrives.
 */
function sendToKennel (dog) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const kennelBox = kennelRef.value?.$el?.getBoundingClientRect()

  if (reduceMotion || !kennelBox || !dog.origin) {
    add(dog)
    return
  }

  // A dog already mid-flight lands immediately rather than being dropped.
  if (inFlight) add(inFlight)

  inFlight = dog
  flight.value = {
    id: `${dog.name}-${Date.now()}`,
    name: dog.name,
    from: dog.origin,
    to: {
      x: kennelBox.left + kennelBox.width / 2,
      y: kennelBox.top + Math.min(110, kennelBox.height / 2)
    }
  }
}

onMounted(() => {
  const el = kennelRef.value?.$el
  if (!el || !('IntersectionObserver' in window)) return

  kennelObserver = new IntersectionObserver(
    ([entry]) => { kennelOnScreen.value = entry.isIntersecting },
    { threshold: 0.08 }
  )
  kennelObserver.observe(el)
})

onBeforeUnmount(() => {
  kennelObserver?.disconnect()
  clearTimeout(pulseTimer)
})

function landDog () {
  if (inFlight) {
    add(inFlight)
    inFlight = null
  }

  flight.value = null
  receiving.value = true
  clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => { receiving.value = false }, 700)
}
</script>

<style scoped>
/* Only earns its place when the kennel is off-screen, which is a stacked
   layout problem; side by side it is always in view. */
.kennel-jump {
  display: none;
}

@media only screen and (max-width: 1020px) {
  .kennel-jump {
    position: fixed;
    bottom: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-pill);
    background-color: var(--color-green-plate);
    color: var(--color-surface);
    box-shadow: var(--shadow-lg);
    font-size: var(--text-xs);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    text-decoration: none;
  }

  .kennel-jump strong {
    font-family: var(--font-display);
    font-size: var(--text-lg);
  }

  .kennel-jump.receiving {
    animation: kennel-jump-pop 700ms cubic-bezier(0.2, 1.6, 0.4, 1);
  }
}

@keyframes kennel-jump-pop {
  0% { transform: translateX(-50%) scale(1); }
  40% { transform: translateX(-50%) scale(1.12); }
  100% { transform: translateX(-50%) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .kennel-jump.receiving {
    animation: none;
  }
}

/* The naming panel had wide empty margins either side of the portrait, so
   the wordmark moves into the left one and the top band disappears. */
.naming-column {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) 1fr;
  align-items: start;
  gap: var(--space-4);
}

.app-header {
  padding-top: var(--space-4);
  text-align: left;
}

/* Split across lines so it fits a narrow rail without shrinking away. */
.app-headline {
  font-size: clamp(1.75rem, 1rem + 2.6vw, 3.25rem);
  line-height: 0.92;
}

.app-headline span {
  display: block;
}

.brand-mark-slot {
  width: clamp(3.5rem, 6vw, 5.5rem);
  margin-top: var(--space-4);
  color: var(--color-green-dark);
}

.app-tagline {
  margin: var(--space-3) 0 0;
  color: var(--color-green-dark);
  font-size: var(--text-xs);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.4;
}

/* Too narrow for a rail: the brand goes back above, on one line. */
@media only screen and (max-width: 860px) {
  .naming-column {
    display: block;
  }

  .app-header {
    padding: 0 var(--space-4) var(--space-2);
    text-align: center;
  }

  .app-headline {
    font-size: var(--text-2xl);
    line-height: 1;
  }

  .app-headline span {
    display: inline;
  }

  .app-tagline {
    margin-top: var(--space-1);
  }

  .brand-mark-slot {
    margin: var(--space-3) auto 0;
  }
}

.app-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  align-items: start;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--space-5);
}

/* Only the kennel still wants a billboard title; the naming column uses a
   small eyebrow so the portrait is the thing you look at. */
#kennel :deep(h3) {
  font-size: var(--text-xl);
}

/* Each panel used to be width: 50vw with min-height: 100vh, which made the
   page 1313px tall on a 732px screen and, once stacked, buried the kennel a
   full screen below the fold. The grid sizes the columns and each panel is
   now only as tall as its content. */
.app-panel {
  padding-top: var(--space-4);
  min-width: 0;
}

/* The kennel rides along while you scroll the naming column, scrolling
   internally once it outgrows the viewport. */
/* A ripple off the panel edge as a dog lands. Deliberately not a
   transform: #kennel is sticky, and transforms on sticky elements are
   a good way to get surprising results. */
#kennel.receiving {
  animation: kennel-receive 700ms cubic-bezier(0.2, 0.8, 0.3, 1);
}

@keyframes kennel-receive {
  0% {
    box-shadow: var(--shadow-md), 0 0 0 0 rgb(37 190 160 / 70%);
  }

  100% {
    box-shadow: var(--shadow-md), 0 0 0 26px rgb(37 190 160 / 0%);
  }
}

#kennel.receiving :deep(.kennel-count-display) {
  animation: count-pop 700ms cubic-bezier(0.2, 1.6, 0.4, 1);
}

@keyframes count-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.14); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  #kennel.receiving,
  #kennel.receiving :deep(.kennel-count-display) {
    animation: none;
  }
}

#kennel {
  position: sticky;
  top: var(--space-4);
  max-height: calc(100vh - var(--space-6));
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: var(--radius-lg);
  padding-bottom: var(--space-6);
  box-shadow: var(--shadow-md);
}

@media only screen and (max-width: 1020px) {
  .app-panels {
    grid-template-columns: 1fr;
    padding: 0 var(--space-3);
  }

  /* Stacked, the kennel is just part of the page flow. */
  #kennel {
    position: static;
    max-height: none;
    overflow-y: visible;
    margin-top: var(--space-5);
  }
}
</style>

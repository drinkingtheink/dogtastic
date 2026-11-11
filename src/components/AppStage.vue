<template>
  <main>
    <h1 class="app-headline">{{ HEADLINE }}</h1>
    <h2 class="app-subheadline">{{ SUB_HEADLINE }}</h2>

    <section class="app-panels">
      <DogSearch
        id="dog-search"
        class="app-panel"
        @new-dog-for-kennel="add"
      />
      <Kennel
        id="kennel"
        class="app-panel yellow-bg"
        :dogs="roster"
        @remove-dog-from-kennel="remove"
        @clear-kennel="clear"
      />
    </section>
  </main>
</template>

<script setup>
import DogSearch from './DogSearch.vue'
import Kennel from './Kennel.vue'
import { useKennel } from '../composables/useKennel'

const HEADLINE = 'Dogtastic!'
const SUB_HEADLINE = 'Name and Claim Your Own Cyber Kennel'

// The roster used to live in this component's data(); it now lives in a
// composable that also persists it to localStorage.
const { roster, add, remove, clear } = useKennel()
</script>

<style scoped>
.app-headline {
  font-size: var(--text-2xl);
  line-height: 1.05;
}

.app-subheadline {
  padding-bottom: var(--space-1);
  color: var(--color-green-dark);
  font-size: var(--text-base);
  letter-spacing: 0.02em;
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

.app-panels :deep(h3) {
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

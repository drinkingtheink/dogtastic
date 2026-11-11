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
  font-size: 200%;
}

.app-subheadline {
  padding-bottom: 0.25rem;
  color: var(--color-green-dark);
  font-size: 1em;
}

.app-panels {
  display: flex;
  align-content: stretch;
}

.app-panels :deep(h3) {
  font-size: 150%;
}

.app-panel {
  width: 50vw;
  min-height: 100vh;
  padding-top: 1rem;
}

#kennel {
  border-radius: var(--radius-lg);
  padding-bottom: 2rem;
}

@media only screen and (max-width: 1300px) {
  .app-subheadline {
    font-size: 0.8em;
  }

  .app-panel :deep(h3) {
    font-size: 1em;
  }
}

@media only screen and (max-width: 1020px) {
  .app-panels {
    display: block;
  }

  .app-panel {
    width: 100vw;
    margin: 0 auto;
  }
}

@media only screen and (max-width: 800px) {
  .app-subheadline {
    font-size: 0.6em;
  }

  #kennel {
    margin-top: 1rem;
    border-radius: 0;
  }
}
</style>

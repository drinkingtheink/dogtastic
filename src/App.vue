<template>
  <div id="app">
    <AppStage />

    <footer>
      <a href="https://github.com/drinkingtheink/dogtastic" target="_blank" rel="noopener">
        About this Project
      </a>
      <a href="https://drinkingtheink.github.io/" target="_blank" rel="noopener">
        About the Author
      </a>
    </footer>
  </div>
</template>

<script setup>
import AppStage from './components/AppStage.vue'
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color-ink);
  margin-top: 0.5rem;
}

footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

footer a {
  text-decoration: none;
  font-size: 80%;
  padding: 0.5rem 1rem;
  background-color: var(--color-green-plate);
  margin: 0 0.25rem;
  transition: all 0.2s;
  border-radius: var(--radius-sm);
  color: var(--color-surface);
  font-family: var(--font-display);
  text-align: center;
}

footer a:hover {
  background-color: var(--color-green-dark);
}

@media only screen and (max-width: 800px) {
  footer {
    display: block;
  }

  footer a {
    display: block;
    margin-bottom: 0.5rem;
  }
}
</style>

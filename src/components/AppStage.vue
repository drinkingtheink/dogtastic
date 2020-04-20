<template>
  <main>
    <h1>{{ headline }}</h1>
    <h2>{{ subHeadline }}</h2>
    <section class="app-panels">
      <DogSearch 
        id="dog-search" 
        class="app-panel" 
        v-on:newDogForKennel="addDogToKennel"
      />
      <Kennel 
          id="kennel" 
          class="app-panel" 
          :dogs="kennelRoster"
      />
    </section>
  </main>
</template>

<script>
import DogSearch from './DogSearch.vue';
import Kennel from './Kennel.vue';

export default {
  name: 'AppStage',
  components: {
    DogSearch,
    Kennel
  },
  props: {
    msg: String
  },
  data() {
    return {
      headline: 'Dogtastic',
      subHeadline: 'Name and Claim Your Own Cyber Kennel',
      kennelRoster:  []
    }
  },
  methods: {
    addDogToKennel (dog) {
        this.kennelRoster.push(dog);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  html,
  body {
    padding: 0;
    margin: 0;
    font-size: 16pt;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    text-transform: uppercase;
    margin: 0;
    padding: 0;
  }

  button {
    display: block;
    text-align: center;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    transition: all .2s;
    border-radius: 10px;
  }

  button:hover {
    cursor: pointer;
    background-color: #333;
    color: white;
  }

  .app-panels {
    display: flex;
    align-content: stretch;
  }

  .app-panel {
    width: 50vw;
    border: 1px solid black;
    min-height: 100vh;
    padding-top: 1rem;
  }
</style>

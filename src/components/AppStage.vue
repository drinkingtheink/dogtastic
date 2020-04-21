<template>
  <main>
    <h1 class="app-headline">{{ headline }}</h1>
    <h2 class="app-subheadline">{{ subHeadline }}</h2>
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
          v-on:removeDogFromKennel="removeDog"
          v-on:clearKennel="clearKennel"
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
      headline: 'Dogtastic!',
      subHeadline: 'Name and Claim Your Own Cyber Kennel',
      kennelRoster:  []
    }
  },
  methods: {
    addDogToKennel (dog) {
        this.kennelRoster.unshift(dog);
    },
    removeDog (dog) {
        let filteredRoster  = this.kennelRoster.filter(kennelDog =>  kennelDog.name != dog.name);
        this.kennelRoster = filteredRoster;
    },
    clearKennel () {
        this.kennelRoster = [];
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
    @import '../styles/typog';
    @import '../styles/palette';
    @import '../styles/bgMixin';
    @import '../styles/breakpoints';
    
    html,
    body {
        padding: 0;
        margin: 0;
        font-size: 16pt;
    }

    body {
        @include funBg;
    }


    h1,
    h2,
    h3,
    h4,
    h5 {
        text-transform: uppercase;
        margin: 0;
        padding: 0;
        color: $green;
    }

    h1,
    h2,
    h3 {
        font-family: 'Bungee Inline', cursive;
    }

    button {
        display: block;
        text-align: center;
        margin: 0 auto;
        padding: .5rem .75rem;
        transition: all .2s;
        border-radius: 10px;
        opacity: .7;

        &:hover {
            cursor: pointer;
            opacity: 1;
        }

        &.primary {
            background-color: #333;
            color: white;
            font-size: 80%;
            font-weight: bold;
        }
    }

    .app-headline {
        font-size: 200%;
    }

    .app-subheadline {
        padding-bottom: .25rem;
        margin-bottom: 1rem;
        color: $green2;

        @media only screen and (max-width: 800) {
            font-size: 90%;
        }
    }

    .app-panels {
        display: flex;
        align-content: stretch;

        @media only screen and (max-width: 1020px) {
            display: block;
        }

        h3 {
            font-size: 150%;
        }
    }

    .app-panel {
        width: 50vw;
        min-height: 100vh;
        padding-top: 1rem;

        @media only screen and (max-width: 1020px) {
            width: 100vw;
            margin: 0 auto;
        }
    }

    #kennel {
        @include yellowBg;
        border-radius: 20px;

        @media only screen and (max-width: 800) {
            margin-top: 1rem;
        }
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
</style>

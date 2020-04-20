<template>
    <div>
        <h3>{{ title }}</h3>
        <h4>{{ headline }}</h4>

        <p v-if="inProcess">Fetching...</p>

        <button v-on:click="fetchDogs">New Dog, Please</button>

        <img v-if="dogImage && !inProcess" :src="dogImage" />
    </div>
</template>

<script>
    export default {
        name: 'DogSearch',
        data() {
            return {
                title: 'Name that Pooch',
                headline: 'What name is worthy of this magnificent creature?',
                inProcess: false,
                dogImage: null,
            }
        },
        methods: {
            fetchDogs () {
                console.log(`FETCHING DOGS....`);
                const baseURI = 'https://dog.ceo/api/breeds/image/random';
                this.inProcess = true;
                this.$http.get(baseURI)
                  .then((result) => {
                      this.dogImage = result.data.message;
                      this.inProcess = false;
                  })
            }
        },
        mounted() {
            this.fetchDogs();
        }
    }
</script>

<style>

</style>
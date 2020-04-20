<template>
    <div>
        <h3>{{ title }}</h3>

        <button v-on:click="fetchDogs">New Dog, Please</button>

        <img class="dog-img" v-bind:class="{ 'in-process': inProcess }" :src="dogImage" />

        <h4>{{ headline }}</h4>

        <div class="name-gallery">
            <button 
                v-for="(name, index) in names" 
                :key="name" 
                class="name"
                :class="index"
                v-on:click="sendDogToKennel(name)"
            >
                {{ name }}
            </button>
        </div>

        <button v-on:click="fetchNames">More Names, Please</button>

        <p v-if="inProcess">Fetching...</p>
    </div>
</template>

<script>
    import nameList from '../fixtures/names';

    const numberOfNames = 10;

    export default {
        name: 'DogSearch',
        data() {
            return {
                title: 'Name that Pooch',
                headline: 'What name is worthy of this magnificent creature?',
                inProcess: false,
                dogImage: null,
                names: null,
                numberOfNames: numberOfNames,
            }
        },
        computed: {
            nameCount () {
                return this.names ? this.names.length : 0;
            }
        },
        methods: {
            fetchDogs () {
                const baseURI = 'https://dog.ceo/api/breeds/image/random';
                this.inProcess = true;
                this.$http.get(baseURI)
                  .then((result) => {
                      this.dogImage = result.data.message;
                      this.inProcess = false;
                  })
            },
            fetchNames () {
                this.names = [];
                let newNames = [];

                for (let i = 0; i < this.numberOfNames; i++) {
                    newNames.push(nameList[Math.floor(Math.random()*nameList.length)]);
                }

                this.names = newNames;
            },
            sendDogToKennel (name) {
                let newDog = {};
                newDog.dogImage = this.dogImage;
                newDog.name = name;
                this.emitDogToKennel(newDog);
                this.removeNameFromList(name);
                this.fetchDogs();
            },
            removeNameFromList (name) {
                let filteredNames = this.names.filter(filtName => filtName != name);
                this.names = filteredNames;
            },
            emitDogToKennel (dog) {
                this.$emit('newDogForKennel', dog);
            }
        },
        mounted() {
            this.fetchDogs();
            this.fetchNames();
        }
    }
</script>

<style scoped>
    .name-gallery {
        display: flex;
        flex-wrap: wrap;
        align-content: center;
        justify-content: center;
    }

    .dog-img {
        max-width: 100%;
        min-height: 20em;
        transition: all .2s;
    }

    .dog-img.in-process {
        opacity: .25;
    }

    .name {
        border: 1px solid black;
        padding: .25rem .5rem;
        margin: .25rem;
        transition: all .2s;
    }

    .name:hover {
        cursor: pointer;
        background-color: #333;
        color: white;
    }

</style>
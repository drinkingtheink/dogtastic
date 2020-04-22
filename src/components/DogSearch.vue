<template>
    <div>
        <h3>{{ title }}</h3>

        <button 
            v-on:click="fetchDogs"
            class="primary fetch-dogs"
        >New Dog, Please</button>

        <div class="img-stage">
            <div 
                class="dog-img" 
                v-bind:class="{ 'in-process': inProcess }" 
                v-bind:style="{ 'background-image': 'url(' + dogImage + ')' }"
            ></div>
            
            <transition name="fade">
                <Bubbles v-if="selectedName" />
            </transition>
            
            <transition name="fade">
                <p class="dog-selected-name" v-if="selectedName">Welcome, {{ selectedName }}!
                </p>
            </transition>
        </div>

        <h4>{{ headline }}</h4>

        <div class="name-gallery">
            <button 
                v-for="(name, index) in names" 
                :key="`dog-name-${index}`"
                class="name"
                v-on:click="sendDogToKennel(name)"
            >
                {{ name }}
            </button>
        </div>

        <button 
            v-on:click="fetchNames"
            class="primary"
        >More Names, Please</button>

        <p v-if="inProcess">Fetching...</p>
    </div>
</template>

<script>
    import Bubbles from './Bubbles';
    import nameList from '../fixtures/names';

    const numberOfNames = 10;
    const transitionTime = 1000;
    const justUnderTransition = transitionTime - 100;

    export default {
        name: 'DogSearh',
        components: {
            Bubbles
        },
        data() {
            return {
                title: 'Name that Pooch',
                headline: 'What name is worthy of this magnificent creature?',
                inProcess: false,
                dogImage: null,
                names: null,
                numberOfNames: numberOfNames,
                selectedName: null,
            }
        },
        computed: {
            nameCount () {
                return this.names ? this.names.length : 0;
            }
        },
        watch: {
            nameCount () {
                if(this.nameCount < 1) {
                    this.fetchNames();
                }
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
                this.selectedName = name;
                this.removeNameFromList(name);
                this.emitDogToKennel(newDog);

                setTimeout(() => this.dogCleanup(), transitionTime);
            },
            dogCleanup () {
                this.fetchDogs();
                this.clearSelectedName();
            },
            removeNameFromList (name) {
                let filteredNames = this.names.filter(filtName => filtName != name);
                this.names = filteredNames;
            },
            emitDogToKennel (dog) {
                this.$emit('newDogForKennel', dog);
            },
            clearSelectedName () {
                setTimeout(() => this.selectedName = null, justUnderTransition);
            }
        },
        mounted() {
            this.fetchDogs();
            this.fetchNames();
        }
    }
</script>

<style lang="scss" scoped>
    @import '../styles/palette';
    @import '../styles/transitions';

    .name-gallery {
        display: flex;
        flex-wrap: wrap;
        align-content: center;
        justify-content: center;
    }

    .fetch-dogs {
        margin-bottom: .25rem;
    }

    $largeDim: 20em;
    $medDim: 18em;
    $smlDim: 15em;

    .dog-img {
        height: $largeDim;
        width: $largeDim;
        transition: all .2s;
        border-radius: 50%;
        border: 4px solid $green;
        background-color: rgba(white, .5);
        background-size: cover;
        background-position: center;
        margin: 0 auto;

        @media only screen and (max-width: 1020px) {
            height: $largeDim;
            width: $largeDim;
        }

        @media only screen and (max-width: 1300px) {
            height: $smlDim;
            width: $smlDim;
        }
    }

    .dog-img.in-process {
        opacity: .25;
        border: 4px solid transparent;
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
        background-color: $green;
        color: white;
        font-weight: bold;
        font-size: 130%;

        @media only screen and (max-width: 1300px) {
            top: 6rem;
        }
    }

    .name {
        border:3px solid $green2;
        padding: .25rem .5rem;
        margin: .25rem;
        transition: all .2s;
        font-size: 120%;
        opacity: 1;
        animation: slowAppear .5s;

        &:hover {
            cursor: pointer;
            background-color: #333;
            color: white;
            border-color: $green2;
        }

        @media only screen and (max-width: 1300px) {
            font-size: 100%;
        }

        @media only screen and (max-width: 800px) {
            font-size: 90%;
        }
    }

</style>
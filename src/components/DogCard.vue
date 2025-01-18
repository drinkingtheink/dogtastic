<template>
    <div 
        class="dog-card"
        :style="{ backgroundImage: `url('${dog.dogImage}')` }"
    >
        <p class="dog-card-name" @click="showFullImg = true">{{ dog.name }}</p>

        <button 
            v-on:click="removeDogFromKennel(dog)"
            class="remove-dog"
        >Remove X</button>

        <dialog v-show='showFullImg'>
            <img class="full-img" :style="{ backgroundImage: `url('${dog.dogImage}')` }" />
            <button 
                v-on:click="showFullImg = false"
                class="remove-full-img"
            >Close</button>
        </dialog>
    </div>
</template>

<script>
    export default {
        name: 'DogCard',
        props: ['dog'],
        data() {
            return {
                showFullImg: false
            }
        },
        methods: {
            removeDogFromKennel (dog) {
                this.$emit('removeDogFromKennel', dog);
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../styles/palette';

    .dog-card {
        border: 2px solid $green;
        height: 12rem;
        width: 44%;
        position: relative;
        margin: .2rem;
        background-size: cover;

        @media only screen and (max-width: 600px) {
            width: 80%;
        }

        &:hover {
            .remove-dog {
                display: inline-block;
            }
        }
    }

    .dog-card-name {
        position: absolute;
        bottom: -1rem;
        background-color: $green;
        color: white;
        width: 100%;
        padding: .2rem 0;
        font-weight: bold;
    }

    .remove-dog {
        transition: all .2s;
        padding: .25rem .5rem;
        display: none;
        top: .25rem;
        right: .25rem;
    }
</style>
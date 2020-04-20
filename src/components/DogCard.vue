<template>
    <div 
        class="dog-card"
        :style="{ backgroundImage: `url('${dog.dogImage}')` }"
    >
        <p class="dog-card-name">{{ dog.name }}</p>

        <button 
            v-on:click="removeDogFromKennel(dog)"
            class="remove-dog"
        >Remove X</button>
    </div>
</template>

<script>
    export default {
        name: 'DogCard',
        props: ['dog'],
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
        height: 10rem;
        width: 10em;
        position: relative;
        margin: .2rem;
        background-size: cover;

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
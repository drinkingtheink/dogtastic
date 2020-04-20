<template>
    <div>
        <h3>{{ title }}</h3>

        <section class="dog-display" v-if="dogCount > 0">
            <DogCard
                v-for="(dog, index) in dogs"
                :key="`dog-${index}')`"
                :dog="dog"
                v-on:removeDogFromKennel="removeDogFromKennel"
            />
        </section>
        <p v-else>{{ emptyKennelMessage }}</p>


        <svg v-if="!dogCount" class="dog-illo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 269 239">
            <g id="Ne8KBH.tif"><path d="M90.53,219.63l-12.65-1.85c.89-4.64,1.82-8.65,6.64-10.46.93-.35,1.75-2.51,1.67-3.77-1.1-17.52-2-35.06-3.82-52.52-.43-4.27-3.42-8.41-5.72-12.32-2.59-4.42-5.91-8.41-8.56-12.79a19.7,19.7,0,0,1-2.38-7c-.88-5.47-1.39-11-2.1-16.91,6.44-4,13.86-8,20.67-12.9s13-10.65,19.41-15.93c12.75,3.6,25.72,9,39.14,10.61,16.84,2,34,.73,51.1.87a6.66,6.66,0,0,0,1-.11c8.88-.88,9.13-1.36,8.87-10.65A87.91,87.91,0,0,0,189,27.19c-2.55-3.89-4.4-8.24-6.57-12.38L184,13.24c1.74.78,3.85,1.17,5.15,2.41,19.15,18.29,32.13,39.42,31,67.15a182.45,182.45,0,0,0,.79,22.78,9.63,9.63,0,0,0,3.65,6c6.77,4.94,9.57,11.31,9.45,19.64-.14,10.11.46,20.25,4.85,29.64.88,1.91,2.91,3.25,4.14,5a24.52,24.52,0,0,1,3.46,6.21c2.82,9,5.36,18,8,27.06.74,2.5,1.55,5,2.33,7.47v8c-5.34,1.08-10.65,2.83-16,3-4.39.18-4.93-2-2.21-5.75,1.62-2.25,4.12-4.28,4.72-6.77,2.29-9.53-2.83-20.15-11.19-25.88q-12.09-8.26-23.55-17.43a38.83,38.83,0,0,1-8.87-9.88c-5.49-9.07-10.06-11.51-20.5-9.61-2.12.38-4.21.89-6.33,1.28-20.16,3.68-40.32,7.45-60.51,11-8.31,1.46-8.22,1.29-8.89,10-.9,11.73-1.64,23.5-3.33,35.13-1,6.76-3.71,13.27-5.65,19.89Z"/><path d="M50.83,12.16c2.19,2.14,4.5,4.16,6.54,6.43Q66,28.15,74.44,37.87c7.69,8.82,15.32,17.69,23.21,26.82C86.76,78.2,73.24,86.22,58.87,93.93c-3-6.48-6-12.53-8.69-18.72-1.61-3.72-4-5.06-8.1-5a52.62,52.62,0,0,1-13.81-1.13C18.85,66.71,16,62,15.16,48.81c4.73-.79,9.62-1.33,14.34-2.52a14.64,14.64,0,0,0,6-3.67,68.27,68.27,0,0,0,8-8.71A17.54,17.54,0,0,0,46.57,27c1-4.71,1.41-9.53,2.07-14.3Z"/></g>
        </svg>

        <button 
            class="clear-kennel primary" 
            v-on:click="clearKennel"
            v-if="dogCount > 0"
        >
            Empty Kennel
        </button>
    </div>
</template>

<script>
    import DogCard from './DogCard.vue';

    export default {
        name: 'Kennel',
        components: {
            DogCard
        },
        props: ['dogs'],
        data() {
            return {
                title: 'Your Pooch Stable',
                emptyKennelMessage: '-- There is a sad lack of pooches in your stable --'
            }
        },
        computed: {
            dogCount() {
                return (this.dogs && this.dogs.length && this.dogs.length > 0) ? this.dogs.length : 0;
            }
        },
        methods: {
            removeDogFromKennel (dog) {
                this.$emit('removeDogFromKennel', dog);
            },
            clearKennel () {
                this.$emit('clearKennel');
            }
        }
    }
</script>

<style scoped>
    .dog-display {
        display: flex;
        align-content: center;
        justify-content: center;
        flex-wrap: wrap;
    }

    .dog-illo {
        max-width: 30%;
        opacity: .5;
    }
</style>
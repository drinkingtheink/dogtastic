<template>
    <div>
        <h3>{{ title }}</h3>

        <section class="dog-display" v-if="dogCount > 0">
            <DogCard
                v-for="(dog, index) in dogs"
                :key="`dog-${index}')`"
                :dog="dog"
            />
        </section>
        <p v-else>-- Add a Pooch to Your Stable --</p>
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
            }
        },
        computed: {
            dogCount() {
                return (this.dogs && this.dogs.length && this.dogs.length > 0) ? this.dogs.length : 0;
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
</style>
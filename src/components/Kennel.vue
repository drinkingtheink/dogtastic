<template>
    <div>
        <h3>{{ title }}</h3>

        <section class="dog-display">
            <DogCard
                v-for="dog in dogs"
                :key="dog.name"
                :dog="dog"
            />
        </section>
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
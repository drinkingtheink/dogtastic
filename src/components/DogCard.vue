<template>
    <div 
        class="dog-card"
        :style="{ backgroundImage: `url('${dog.dogImage}')` }"
    >
        <p class="dog-card-name">{{ dog.name }}</p>
    </div>
</template>

<script>
    export default {
        name: 'DogCard',
        props: ['dog']
    }
</script>

<style scoped>
.dog-card {
    border: 2px solid black;
    height: 10rem;
    width: 10em;
    position: relative;
    margin: .2rem;
    background-size: cover;
}

.dog-card-name {
    position: absolute;
    bottom: -1rem;
    background-color: black;
    color: white;
    width: 100%;
    padding: .2rem 0;
}
</style>
<template>
    <div id="app">
        <AppStage/>
    </div>
</template>

<script>
    import AppStage from './components/AppStage.vue'

    export default {
        name: 'App',
        components: {
            AppStage
        },
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: .5rem;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }    
</style>

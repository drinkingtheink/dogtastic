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

<style lang="scss">
    @import './styles/palette';
    @import './styles/typog';

    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: .5rem;
    }

    footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 0;

        a {
            text-decoration: none;
            font-size: 80%;
            padding: .5rem 1rem;
            background-color: $green;
            margin: 0 .25rem;
            transition: all .2s;
            border-radius: 5px;
            color: white;
            font-family: 'Bungee Inline', cursive;

            &:hover {
                background-color: $green2;
            }
        }
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }    
</style>

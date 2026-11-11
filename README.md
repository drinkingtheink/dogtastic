# Dogtastic! Name and Claim Your Own Cyber Kennel

![Dogtastic! in Action](https://i.ibb.co/BG63JDh/dogtastic.png)

Fetch a random dog, give it a name worthy of the creature, and collect it
in your kennel. Your kennel is saved in the browser, so it is still there
when you come back.

Built with **Vue 3** (Composition API, `<script setup>`) and **Vite**.

### Dog images provided by [Dog API](https://dog.ceo/dog-api/)
### Background patterns by [Hero Patterns](https://www.heropatterns.com/)

## Project setup
```
npm install
```

### Starts a dev server with hot module replacement
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Serves the production build locally
```
npm run preview
```

### Lints and fixes files
```
npm run lint
```

## How it is put together

```
index.html               Vite entry point; fonts and meta tags
src/
  main.js                Mounts the app, imports the global stylesheets
  App.vue                Page shell and footer
  components/
    AppStage.vue         Two-panel layout, owns the kennel
    DogSearch.vue        Dog portrait and the name gallery
    Bubbles.vue          The confetti burst
    Kennel.vue           Roster, empty state
    DogCard.vue          One dog, with a full-size photo dialog
  composables/
    useDogApi.js         Fetches portraits from dog.ceo
    useKennel.js         The roster, persisted to localStorage
  styles/
    tokens.css           Custom properties: palette, type, shape
    base.css             Element defaults
    patterns.css         Hero Patterns backgrounds
    animations.css       Keyframes and Vue transition classes
  fixtures/names.js      The pool of candidate names
```

State flows down as props and back up as events; there is no store.

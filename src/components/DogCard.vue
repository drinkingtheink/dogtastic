<template>
  <div
    class="dog-card"
    :style="{ backgroundImage: `url('${dog.image}')` }"
  >
    <button class="dog-card-name" @click="openFullImg">
      {{ dog.name }}
    </button>

    <button class="remove-dog" @click="emit('removeDogFromKennel', dog)">
      Remove X
    </button>

    <!-- A real modal dialog: showModal() brings the backdrop, Esc-to-close
         and the focus trap that v-show alone could never provide. -->
    <dialog ref="dialogEl" class="full-img-dialog" @click="closeOnBackdrop">
      <img class="full-img" :src="dog.image" :alt="`${dog.name}, at full size`">
      <button class="remove-full-img primary" @click="dialogEl.close()">
        Close
      </button>
    </dialog>
  </div>
</template>

<script setup>
import { useTemplateRef } from 'vue'

defineProps({
  dog: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['removeDogFromKennel'])

const dialogEl = useTemplateRef('dialogEl')

function openFullImg () {
  dialogEl.value.showModal()
}

/* Clicks on the backdrop land on the dialog element itself, since the
   content sits in children. */
function closeOnBackdrop (event) {
  if (event.target === dialogEl.value) dialogEl.value.close()
}
</script>

<style scoped>
.dog-card {
  border: 2px solid var(--color-green);
  height: 12rem;
  width: 44%;
  position: relative;
  margin: 0.2rem;
  background-size: cover;
  background-position: center;
}

.dog-card:hover .remove-dog,
.dog-card:focus-within .remove-dog {
  display: inline-block;
}

.dog-card-name {
  position: absolute;
  bottom: -1rem;
  left: 0;
  background-color: var(--color-green);
  color: var(--color-surface);
  width: 100%;
  padding: 0.2rem 0;
  font-weight: bold;
  font-family: var(--font-body);
  font-size: 1rem;
  border: 0;
  border-radius: 0;
  opacity: 1;
  margin: 0;
}

.remove-dog {
  transition: all 0.2s;
  padding: 0.25rem 0.5rem;
  display: none;
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background-color: var(--color-surface);
}

.full-img-dialog {
  border: 4px solid var(--color-green);
  border-radius: var(--radius-md);
  padding: 1rem;
  background-color: var(--color-surface);
  max-width: min(90vw, 40rem);
}

.full-img-dialog::backdrop {
  background-color: rgb(55 67 83 / 70%);
}

.full-img {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-sm);
}

.remove-full-img {
  margin-top: 1rem;
}

@media only screen and (max-width: 600px) {
  .dog-card {
    width: 80%;
  }
}
</style>

<template>
  <div
    class="dog-card"
    :style="{ backgroundImage: `url('${dog.image}')` }"
  >
    <p v-if="imageFailed" class="dog-card-fallback">
      <span class="dog-card-initial">{{ initial }}</span>
      <span class="dog-card-fallback-note">photo ran off</span>
    </p>

    <button class="dog-card-name" @click="openFullImg">
      {{ dog.name }}
      <span v-if="dog.breed" class="dog-card-breed">{{ dog.breed }}</span>
    </button>

    <button class="remove-dog" @click="emit('removeDogFromKennel', dog)">
      Remove X
    </button>

    <!-- A real modal dialog: showModal() brings the backdrop, Esc-to-close
         and the focus trap that v-show alone could never provide. -->
    <dialog ref="dialogEl" class="full-img-dialog" @click="closeOnBackdrop">
      <img class="full-img" :src="dog.image" :alt="`${dog.name}, at full size`">
      <p class="full-img-caption">
        <strong>{{ dog.name }}</strong>
        <span v-if="dog.breed"> &middot; {{ dog.breed }}</span>
      </p>
      <button class="remove-full-img primary" @click="dialogEl.close()">
        Close
      </button>
    </dialog>
  </div>
</template>

<script setup>
import { computed, useTemplateRef } from 'vue'
import { useImageStatus } from '../composables/useImageStatus'

const props = defineProps({
  dog: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['removeDogFromKennel'])

const { status } = useImageStatus(() => props.dog.image)
const imageFailed = computed(() => status.value === 'error')
const initial = computed(() => props.dog.name.trim().charAt(0).toUpperCase())

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
  height: 12rem;
  width: calc(50% - var(--space-3));
  position: relative;
  margin: 0;
  border: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-color: var(--color-green-dark);
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dog-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* Beats .dog-card's own position so a card leaving the kennel drops out of
   flow and the surviving cards can slide into the gap. */
.dog-card.card-leave-active {
  position: absolute;
}

.dog-card-fallback {
  position: absolute;
  inset: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  background:
    linear-gradient(140deg, var(--color-green-plate), var(--color-green-dark));
  color: var(--color-surface);
}

.dog-card-initial {
  font-family: var(--font-display);
  font-size: 2.5rem;
  line-height: 1;
}

.dog-card-fallback-note {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.dog-card-name {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  margin: 0;
  padding: var(--space-2);
  border: 0;
  border-radius: 0;
  background-color: var(--color-green-plate);
  color: var(--color-surface);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: bold;
  text-align: center;
}

.dog-card-breed {
  display: block;
  font-weight: normal;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.remove-dog {
  display: none;
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-md);
  font-size: var(--text-xs);
  font-weight: bold;
}

.dog-card:hover .remove-dog,
.dog-card:focus-within .remove-dog {
  display: block;
}

.full-img-dialog {
  border: 0;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
  max-width: min(90vw, 40rem);
}

.full-img-dialog::backdrop {
  background-color: rgb(55 67 83 / 70%);
}

.full-img {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-md);
}

.full-img-caption {
  margin: var(--space-3) 0 0;
  color: var(--color-ink);
  font-size: var(--text-sm);
}

.remove-full-img {
  margin-top: var(--space-4);
}

@media only screen and (max-width: 600px) {
  .dog-card {
    width: 100%;
  }
}
</style>

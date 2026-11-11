<template>
  <div
    class="dog-card"
    :class="{ dragging }"
    :style="cardStyle"
    @pointerdown="startDrag"
    @pointermove="onDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @dblclick="recentre"
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

    <!-- Drag the photo anywhere on the card; this is the discoverable
         affordance and the keyboard route to the same thing. -->
    <button
      class="reframe"
      :aria-label="`Reposition ${dog.name}'s photo. Arrow keys to nudge, Backspace to centre.`"
      @keydown="nudge"
    >
      <span aria-hidden="true">&#10021;</span>
    </button>

    <!-- A real modal dialog: showModal() brings the backdrop, Esc-to-close
         and the focus trap that v-show alone could never provide. -->
    <dialog
      ref="dialogEl"
      class="full-img-dialog"
      @click="closeOnBackdrop"
      @close="fullImgOpen = false"
    >
      <!-- Wraps the photo so the decorations land on it, rather than
           spilling into the dialog's caption and buttons. Only mounted
           while open: a dialog renders its contents either way, and every
           card has one. -->
      <div class="full-img-frame">
        <PupDecor
          v-if="fullImgOpen"
          :count="16"
          theme="light"
          layout="cluster"
          caption
        />

        <img class="full-img" :src="dog.image" :alt="`${dog.name}, at full size`">
      </div>
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
import { ref, computed, useTemplateRef } from 'vue'
import PupDecor from './PupDecor.vue'
import { useImageStatus } from '../composables/useImageStatus'

const props = defineProps({
  dog: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['removeDogFromKennel', 'repositionDog'])

const STEP = 0.06

const dragging = ref(false)
/* Held locally while the pointer is down so the roster -- and the
   localStorage write behind it -- is only touched once, on release. */
const preview = ref(null)
let origin = null

const focus = computed(() => preview.value ?? {
  x: props.dog.focusX ?? 0.5,
  y: props.dog.focusY ?? 0.5
})

const cardStyle = computed(() => ({
  backgroundImage: `url('${props.dog.image}')`,
  backgroundPosition: `${focus.value.x * 100}% ${focus.value.y * 100}%`
}))

const clamp = value => Math.min(1, Math.max(0, value))

function commit (next) {
  emit('repositionDog', { id: props.dog.id, focusX: next.x, focusY: next.y })
}

function startDrag (event) {
  // Leave the buttons and the name alone.
  if (event.target.closest('button')) return

  origin = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    x: focus.value.x,
    y: focus.value.y,
    width: event.currentTarget.clientWidth,
    height: event.currentTarget.clientHeight
  }
  dragging.value = true

  // Keeps the drag alive if the pointer leaves the card. Not worth failing
  // the whole gesture over if the browser will not grant it.
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // Dragging still works, it just stops at the card's edge.
  }
}

function onDrag (event) {
  if (!origin) return

  // Dragging down should reveal what is above, so the offset moves against
  // the pointer. A full card's travel covers the whole range.
  preview.value = {
    x: clamp(origin.x - (event.clientX - origin.pointerX) / origin.width),
    y: clamp(origin.y - (event.clientY - origin.pointerY) / origin.height)
  }
}

function endDrag (event) {
  if (!origin) return
  origin = null
  dragging.value = false

  /* Save before releasing the pointer. Releasing a capture the browser is
     no longer tracking throws, and with that call first the throw took the
     commit with it: the card showed the new framing from local state that
     was never written, then reverted on reload. */
  if (preview.value) {
    commit(preview.value)
    preview.value = null
  }

  try {
    event.currentTarget.releasePointerCapture(event.pointerId)
  } catch {
    // Already released, or never captured.
  }
}

function recentre () {
  commit({ x: 0.5, y: 0.5 })
}

function nudge (event) {
  const moves = {
    ArrowUp: [0, STEP],
    ArrowDown: [0, -STEP],
    ArrowLeft: [STEP, 0],
    ArrowRight: [-STEP, 0]
  }

  if (event.key === 'Backspace') {
    event.preventDefault()
    return recentre()
  }

  const move = moves[event.key]
  if (!move) return

  event.preventDefault()
  commit({ x: clamp(focus.value.x + move[0]), y: clamp(focus.value.y + move[1]) })
}

const { status } = useImageStatus(() => props.dog.image)
const imageFailed = computed(() => status.value === 'error')
const initial = computed(() => props.dog.name.trim().charAt(0).toUpperCase())

const dialogEl = useTemplateRef('dialogEl')

const fullImgOpen = ref(false)

function openFullImg () {
  fullImgOpen.value = true
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
  /* Two columns separated by one gap means each card is half the row
     minus half a gap; subtracting a whole gap left a gap's worth of
     space unused. */
  width: calc(50% - var(--space-3) / 2);
  aspect-ratio: 3 / 2;
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
}

.dog-card {
  cursor: grab;
  touch-action: none;
}

.dog-card.dragging {
  cursor: grabbing;
}

.reframe {
  display: none;
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  margin: 0;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface);
  color: var(--color-green-deep);
  box-shadow: var(--shadow-md);
  font-size: var(--text-xs);
  line-height: 1;
}

.dog-card:hover .reframe,
.dog-card:focus-within .reframe {
  display: block;
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
  position: relative;
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

.full-img-frame {
  position: relative;
  width: fit-content;
  margin: 0 auto;
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

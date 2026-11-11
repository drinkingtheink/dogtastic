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
      @close="scheduleDecorTeardown"
    >
      <!-- Wraps the photo so the decorations land on it, rather than
           spilling into the dialog's caption and buttons. Only mounted
           while open: a dialog renders its contents either way, and every
           card has one. -->
      <div class="full-img-frame">
        <PupDecor
          v-if="fullImgOpen"
          :count="MOTIF_COUNT"
          :seed="dog.id"
          :offset-x="dog.motifX ?? 0"
          :offset-y="dog.motifY ?? 0"
          theme="light"
          layout="cluster"
          caption
          movable
          @move="moveMotif"
        />

        <img
          class="full-img"
          :src="dog.image"
          :alt="`${dog.name}, at full size`"
          draggable="false"
        >
      </div>
      <p class="full-img-caption">
        <strong>{{ dog.name }}</strong>
        <span v-if="dog.breed"> &middot; {{ dog.breed }}</span>
      </p>
      <div class="full-img-actions">
        <button class="primary" :disabled="saving" @click="save">
          {{ saving ? 'Saving...' : 'Download' }}
        </button>

        <button class="utility" @click="dialogEl.close()">
          Close
        </button>
      </div>

      <p v-if="saveError" class="full-img-error">
        Could not save that one. Try again?
      </p>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, useTemplateRef } from 'vue'
import PupDecor from './PupDecor.vue'
import { downloadCard } from '../utils/downloadCard'
import { useImageStatus } from '../composables/useImageStatus'

const props = defineProps({
  dog: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['removeDogFromKennel', 'repositionDog', 'moveMotif'])

const MOTIF_COUNT = 16

const saving = ref(false)
const saveError = ref(false)

function moveMotif (offset) {
  emit('moveMotif', { id: props.dog.id, motifX: offset.x, motifY: offset.y })
}

async function save () {
  saving.value = true
  saveError.value = false

  try {
    // Measured, so the export matches the arrangement on screen rather
    // than guessing at a reference size.
    const photo = dialogEl.value?.querySelector('.full-img')
    const caption = dialogEl.value?.querySelector('.decor-caption')

    await downloadCard(props.dog, {
      count: MOTIF_COUNT,
      theme: 'light',
      displayWidth: photo?.clientWidth ?? 0,
      captionPx: caption ? parseFloat(getComputedStyle(caption).fontSize) : 0
    })
  } catch {
    saveError.value = true
  } finally {
    saving.value = false
  }
}

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

  /* The close-up dialog is a child of this card, so everything that
     happens inside it bubbles out to here. Without this the card was
     reframing its own photo while you dragged the motif, and winning the
     pointer capture, which left the motif stuck to the cursor. */
  if (event.target.closest('dialog')) return

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

onBeforeUnmount(() => clearTimeout(teardownTimer))

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

const EXIT_MS = 260
let teardownTimer = null

function openFullImg () {
  clearTimeout(teardownTimer)
  fullImgOpen.value = true
  dialogEl.value.showModal()
}

/* Held until the dialog has finished animating out, otherwise the
   decorations vanish a beat before the modal does. */
function scheduleDecorTeardown () {
  clearTimeout(teardownTimer)
  teardownTimer = setTimeout(() => { fullImgOpen.value = false }, EXIT_MS)
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
  /* Dragging to reframe was selecting the name and breed under the
     pointer, which flashed a highlight across the card. */
  user-select: none;
  -webkit-user-select: none;
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

  /* A closed dialog goes straight to display: none, so an exit animation
     needs the discrete properties carried along with the visible ones.
     allow-discrete holds display and overlay open until the transition
     finishes; @starting-style gives the entry somewhere to come from. */
  opacity: 0;
  transform: scale(0.92) translateY(12px);
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.2, 1.3, 0.4, 1),
    overlay 260ms allow-discrete,
    display 260ms allow-discrete;
}

.full-img-dialog[open] {
  opacity: 1;
  transform: scale(1) translateY(0);
}

@starting-style {
  .full-img-dialog[open] {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
  }
}

.full-img-dialog::backdrop {
  background-color: rgb(55 67 83 / 0%);
  transition:
    background-color 220ms ease,
    overlay 260ms allow-discrete,
    display 260ms allow-discrete;
}

.full-img-dialog[open]::backdrop {
  background-color: rgb(55 67 83 / 70%);
}

@starting-style {
  .full-img-dialog[open]::backdrop {
    background-color: rgb(55 67 83 / 0%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .full-img-dialog,
  .full-img-dialog::backdrop {
    transition-duration: 1ms;
  }

  .full-img-dialog {
    transform: none;
  }
}

.full-img-frame {
  position: relative;
  width: fit-content;
  margin: 0 auto;
}

.full-img {
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  max-width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-md);
}

.full-img-caption {
  margin: var(--space-3) 0 0;
  color: var(--color-ink);
  font-size: var(--text-sm);
}

.full-img-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-4);
}

.full-img-actions button {
  margin: 0;
}

.full-img-error {
  margin: var(--space-3) 0 0;
  color: var(--color-green-dark);
  font-size: var(--text-sm);
  text-align: center;
}

@media only screen and (max-width: 600px) {
  .dog-card {
    width: 100%;
  }
}
</style>

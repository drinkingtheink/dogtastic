<template>
  <button class="utility quiz-trigger" @click="open">
    Guess That Breed
  </button>

  <dialog ref="dialogEl" class="quiz" aria-label="Guess that breed" @close="reset">
    <header class="quiz-bar">
      <p class="quiz-progress">
        <span v-if="status !== 'done'">Question {{ Math.max(asked, 1) }} of {{ ROUND_LENGTH }}</span>
        <span v-else>Round over</span>
      </p>

      <p class="quiz-score">
        {{ score }} right<span v-if="best > 0"> &middot; best {{ best }}</span>
      </p>

      <button class="quiz-close" @click="dialogEl.close()">Close</button>
    </header>

    <p v-if="status === 'loading'" class="quiz-note">Finding a dog...</p>

    <div v-else-if="status === 'error'" class="quiz-note">
      <p>The Dog API is not answering just now.</p>
      <button class="primary" @click="start">Try again</button>
    </div>

    <!-- Scoreboard -->
    <div v-else-if="status === 'done'" class="quiz-done">
      <p class="quiz-final">{{ score }}<span>/{{ ROUND_LENGTH }}</span></p>
      <p class="quiz-verdict">{{ verdict }}</p>
      <div class="quiz-done-actions">
        <button class="primary" @click="start">Play again</button>
        <button class="utility" @click="dialogEl.close()">Done</button>
      </div>
      <Confetti v-if="score >= ROUND_LENGTH - 2" :origin="{ x: 0.5, y: 0.4 }" />
    </div>

    <!-- The question -->
    <div v-else-if="question" class="quiz-round">
      <div
        class="quiz-photo"
        :style="{ backgroundImage: `url('${question.url}')` }"
        role="img"
        :aria-label="status === 'answered' ? `A ${question.answer}` : 'A dog of some breed'"
      />

      <p class="quiz-ask">What breed is this?</p>

      <ul class="quiz-options">
        <li v-for="option in question.options" :key="option">
          <button
            class="quiz-option"
            :class="optionClass(option)"
            :disabled="status === 'answered'"
            @click="choose(option, $event)"
          >
            <span v-if="status === 'answered' && option === question.answer" aria-hidden="true">&#10003;</span>
            <span
              v-else-if="status === 'answered' && option === picked"
              aria-hidden="true"
            >&#10007;</span>
            {{ option }}
          </button>
        </li>
      </ul>

      <p
        v-if="status === 'answered'"
        class="quiz-verdict-line"
        :class="{ cheering: wasRight }"
        role="status"
      >
        {{ wasRight ? 'Correct!' : `It was a ${question.answer}.` }}
      </p>

      <!-- A cone out of the button you picked, not the full works: this
           happens up to eight times a round. -->
      <Confetti
        v-if="cheer"
        :origin="cheer"
        intensity="small"
        @done="cheer = null"
      />

      <button v-if="status === 'answered'" class="primary quiz-next" @click="advance">
        {{ isLastQuestion ? 'See the score' : 'Next dog' }}
      </button>
    </div>
  </dialog>
</template>

<script setup>
import { ref, computed, useTemplateRef } from 'vue'
import Confetti from './Confetti.vue'
import { useBreedCatalog } from '../composables/useBreedCatalog'
import { useBreedQuiz, ROUND_LENGTH } from '../composables/useBreedQuiz'

const dialogEl = useTemplateRef('dialogEl')

const { catalog } = useBreedCatalog()
const {
  status, question, asked, score, picked, best,
  wasRight, isLastQuestion, start, answer, advance, reset
} = useBreedQuiz(catalog)

const verdict = computed(() => {
  const ratio = score.value / ROUND_LENGTH
  if (ratio === 1) return 'Flawless. You have met a lot of dogs.'
  if (ratio >= 0.75) return 'Very good. Only the tricky ones got you.'
  if (ratio >= 0.5) return 'Respectable. The terriers are a minefield.'
  if (ratio >= 0.25) return 'Room to grow. They all have four legs though.'
  return 'Every one of them was a good dog regardless.'
})

const cheer = ref(null)

/* Fires from the button that was clicked, so the burst comes out of the
   answer rather than the middle of the dialog. */
function choose (option, event) {
  const right = option === question.value?.answer
  answer(option)

  if (!right) return

  const box = event.currentTarget.getBoundingClientRect()
  cheer.value = {
    x: (box.left + box.width / 2) / window.innerWidth,
    y: (box.top + box.height / 2) / window.innerHeight
  }
}

function optionClass (option) {
  if (status.value !== 'answered') return null
  if (option === question.value.answer) return 'right'
  if (option === picked.value) return 'wrong'
  return 'muted'
}

function open () {
  dialogEl.value.showModal()
  start()
}
</script>

<style scoped>
.quiz-trigger {
  margin-top: var(--space-4);
  width: 100%;
}

.quiz {
  width: min(92vw, 34rem);
  max-width: none;
  padding: 0;
  border: 0;
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-lg);

  opacity: 0;
  transform: scale(0.94) translateY(10px);
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.2, 1.3, 0.4, 1),
    overlay 260ms allow-discrete,
    display 260ms allow-discrete;
}

.quiz[open] {
  opacity: 1;
  transform: scale(1) translateY(0);
}

@starting-style {
  .quiz[open] {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
}

.quiz::backdrop {
  background-color: rgb(11 59 50 / 0%);
  transition:
    background-color 220ms ease,
    overlay 260ms allow-discrete,
    display 260ms allow-discrete;
}

.quiz[open]::backdrop {
  background-color: rgb(11 59 50 / 78%);
}

@starting-style {
  .quiz[open]::backdrop {
    background-color: rgb(11 59 50 / 0%);
  }
}

.quiz-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-green-dark);
  color: var(--color-surface);
}

.quiz-progress,
.quiz-score {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.quiz-score {
  margin-left: auto;
  opacity: 0.85;
}

.quiz-close {
  margin: 0;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background-color: rgb(255 255 255 / 18%);
  color: var(--color-surface);
  font-size: var(--text-xs);
  font-weight: bold;
}

.quiz-close:hover {
  background-color: rgb(255 255 255 / 32%);
}

.quiz-note,
.quiz-round,
.quiz-done {
  padding: var(--space-5) var(--space-4) var(--space-6);
  text-align: center;
}

.quiz-note {
  color: var(--color-green-dark);
  font-weight: 600;
}

.quiz-photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  background-color: var(--color-green-dark);
  background-size: cover;
  background-position: center;
  box-shadow: var(--shadow-md);
}

.quiz-ask {
  margin: var(--space-4) 0 var(--space-3);
  color: var(--color-green-text);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  text-transform: uppercase;
}

.quiz-options {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.quiz-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin: 0;
  padding: var(--space-3);
  border: 2px solid rgb(18 131 109 / 25%);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface);
  color: var(--color-green-dark);
  font-size: var(--text-base);
  font-weight: bold;
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--color-green-plate);
  background-color: rgb(18 131 109 / 10%);
}

/* No red in this palette, so the tick and cross carry the result and the
   fills only reinforce it. */
.quiz-option.right {
  background-color: var(--color-green-dark);
  border-color: var(--color-green-dark);
  color: var(--color-surface);
  animation: quiz-pop 560ms cubic-bezier(0.2, 1.6, 0.35, 1);
}

@keyframes quiz-pop {
  0% { transform: scale(1); }
  35% { transform: scale(1.06); }
  60% { transform: scale(0.985); }
  100% { transform: scale(1); }
}

.quiz-option.wrong {
  background-color: var(--color-gray);
  border-color: var(--color-gray);
  color: var(--color-surface);
}

.quiz-option.muted {
  opacity: 0.45;
}

.quiz-option:disabled {
  cursor: default;
}

.quiz-verdict-line {
  margin: var(--space-4) 0 0;
  color: var(--color-green-dark);
  font-weight: 700;
}

.quiz-verdict-line.cheering {
  color: var(--color-green-text);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  animation: quiz-stamp 480ms cubic-bezier(0.16, 1.6, 0.4, 1);
}

@keyframes quiz-stamp {
  0% { transform: scale(1.9) rotate(-8deg); opacity: 0; }
  55% { transform: scale(0.94) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); }
}

.quiz-next {
  margin-top: var(--space-3);
}

.quiz-final {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3rem, 14vw, 5rem);
  line-height: 1;
  color: var(--color-green-text);
}

.quiz-final span {
  font-size: 0.4em;
  color: var(--color-green-dark);
}

.quiz-verdict {
  margin: var(--space-3) auto var(--space-5);
  max-width: 22rem;
  color: var(--color-green-dark);
  font-weight: 600;
}

.quiz-done-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.quiz-done-actions button {
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .quiz-option.right,
  .quiz-verdict-line.cheering {
    animation: none;
  }

  .quiz,
  .quiz::backdrop {
    transition-duration: 1ms;
  }

  .quiz {
    transform: none;
  }
}
</style>

import { ref, computed } from 'vue'
import { breedFromUrl } from '../utils/breed'

const RANDOM_DOG_URL = 'https://dog.ceo/api/breeds/image/random'
const BEST_KEY = 'dogtastic:quiz-best'

export const ROUND_LENGTH = 8
const OPTION_COUNT = 4

function readBest () {
  try {
    const stored = Number(localStorage.getItem(BEST_KEY))
    return Number.isFinite(stored) ? stored : 0
  } catch {
    return 0
  }
}

function writeBest (value) {
  try {
    localStorage.setItem(BEST_KEY, String(value))
  } catch {
    // Private window or storage blocked; the round still plays.
  }
}

async function randomDogUrl () {
  const response = await fetch(RANDOM_DOG_URL)
  if (!response.ok) throw new Error(`Dog API responded ${response.status}`)

  const { message } = await response.json()
  if (!message) throw new Error('Dog API returned no image')

  return message
}

/** Resolves once the photo is ready to paint, so a question never stalls. */
async function preload (url) {
  const image = new Image()
  image.src = url
  await image.decode()
  return url
}

const shuffle = list => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Three wrong answers. One of them deliberately shares the answer's last
 * word where the catalogue allows -- a Border Terrier beside a Norfolk
 * Terrier -- because three unrelated breeds make the question trivial.
 */
function pickDistractors (catalog, answer) {
  const others = catalog.filter(breed => breed !== answer)
  const family = answer.split(' ').at(-1)
  const near = others.filter(breed => breed.endsWith(` ${family}`))

  const chosen = []
  if (near.length) chosen.push(near[Math.floor(Math.random() * near.length)])

  for (const breed of shuffle(others)) {
    if (chosen.length >= OPTION_COUNT - 1) break
    if (!chosen.includes(breed)) chosen.push(breed)
  }

  return chosen
}

export function useBreedQuiz (catalog) {
  const status = ref('idle')
  const question = ref(null)
  const asked = ref(0)
  const score = ref(0)
  const picked = ref(null)
  const best = ref(readBest())

  // A question already fetched and decoded, waiting its turn.
  let queued = null

  const isLastQuestion = computed(() => asked.value >= ROUND_LENGTH)
  const wasRight = computed(() => picked.value === question.value?.answer)

  async function buildQuestion () {
    // The odd breed is missing from the catalogue; try again rather than
    // asking a question with no right answer among the options.
    for (let attempt = 0; attempt < 6; attempt++) {
      const url = await randomDogUrl()
      const answer = breedFromUrl(url)
      if (!answer || !catalog.value.includes(answer)) continue

      await preload(url)
      return { url, answer, options: shuffle([answer, ...pickDistractors(catalog.value, answer)]) }
    }

    throw new Error('Could not put a question together')
  }

  async function serveNext () {
    status.value = 'loading'
    picked.value = null

    try {
      question.value = queued ?? await buildQuestion()
      queued = null
      asked.value += 1
      status.value = 'asking'
    } catch {
      status.value = 'error'
    }
  }

  /** Lines the next one up while the answer is on screen. */
  async function prefetch () {
    if (queued || isLastQuestion.value) return

    try {
      queued = await buildQuestion()
    } catch {
      queued = null
    }
  }

  async function start () {
    asked.value = 0
    score.value = 0
    queued = null
    await serveNext()
  }

  function answer (option) {
    if (status.value !== 'asking') return

    picked.value = option
    if (option === question.value.answer) score.value += 1

    status.value = 'answered'
    prefetch()
  }

  async function advance () {
    if (isLastQuestion.value) {
      if (score.value > best.value) {
        best.value = score.value
        writeBest(score.value)
      }
      status.value = 'done'
      return
    }

    await serveNext()
  }

  function reset () {
    status.value = 'idle'
    question.value = null
    picked.value = null
    asked.value = 0
    score.value = 0
    queued = null
  }

  return {
    status,
    question,
    asked,
    score,
    picked,
    best,
    wasRight,
    isLastQuestion,
    start,
    answer,
    advance,
    reset
  }
}

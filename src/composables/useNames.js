import { ref } from 'vue'

const NAMES_PER_DRAW = 10

/* The name list is ~97KB, which was about two thirds of the whole bundle.
   Holding it behind a dynamic import lets Vite emit it as its own chunk, so
   it no longer has to be downloaded and parsed before the first dog appears.
   Module-level so the chunk is fetched once per page load, not per caller. */
let namePool = null

async function loadNamePool () {
  if (!namePool) {
    const module = await import('../fixtures/names.js')
    namePool = module.default
  }
  return namePool
}

export function useNames () {
  const names = ref([])
  const loading = ref(false)

  /** Draws without replacement, so the gallery never shows a name twice. */
  async function drawNames () {
    loading.value = true

    try {
      const pool = await loadNamePool()
      const drawn = new Set()

      while (drawn.size < NAMES_PER_DRAW && drawn.size < pool.length) {
        drawn.add(pool[Math.floor(Math.random() * pool.length)])
      }

      names.value = [...drawn]
    } finally {
      loading.value = false
    }
  }

  function removeName (name) {
    names.value = names.value.filter(candidate => candidate !== name)
  }

  return { names, loading, drawNames, removeName }
}

import { ref } from 'vue'

const RANDOM_DOG_URL = 'https://dog.ceo/api/breeds/image/random'

/**
 * Fetches random dog portraits from the Dog API (dog.ceo).
 *
 * Replaces the old axios-on-Vue.prototype.$http arrangement: Vue 3 has no
 * prototype to hang globals off, and the browser's fetch covers this need.
 */
export function useDogApi () {
  const image = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDog () {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(RANDOM_DOG_URL)
      if (!response.ok) throw new Error(`Dog API responded ${response.status}`)

      const { message } = await response.json()
      image.value = message
    } catch (cause) {
      // The old version had no catch at all, so a failed request left the
      // spinner up forever. Keep the previous portrait on screen instead.
      error.value = cause
    } finally {
      loading.value = false
    }
  }

  return { image, loading, error, fetchDog }
}

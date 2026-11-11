import { ref, computed } from 'vue'
import { breedFromUrl } from '../utils/breed'

const RANDOM_DOG_URL = 'https://dog.ceo/api/breeds/image/random'

async function requestUrl () {
  const response = await fetch(RANDOM_DOG_URL)
  if (!response.ok) throw new Error(`Dog API responded ${response.status}`)

  const { message } = await response.json()
  if (!message) throw new Error('Dog API returned no image')

  return message
}

/**
 * Resolves once the browser actually has the pixels ready to paint.
 *
 * The portrait is painted with background-image, which fires no load event,
 * so the old code swapped the URL the moment the API answered and left an
 * empty frame until the photo arrived. Decoding first means the swap only
 * happens when there is something to show.
 */
async function preload (url) {
  const image = new Image()
  image.src = url
  await image.decode()
  return url
}

export function useDogApi () {
  const image = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // The breed is already encoded in the URL, so this costs no extra request.
  const breed = computed(() => breedFromUrl(image.value))

  // A dog already fetched and decoded, waiting for its turn on screen.
  let queued = null

  async function fetchDog () {
    loading.value = true
    error.value = null

    try {
      const url = queued ?? await preload(await requestUrl())
      queued = null
      image.value = url
    } catch (cause) {
      // The previous dog stays on screen rather than blanking out.
      error.value = cause
    } finally {
      loading.value = false
    }
  }

  /**
   * Lines up the next dog while the current one is being celebrated, so the
   * swap at the end of the celebration is instant.
   */
  async function prefetchNext () {
    if (queued) return

    try {
      queued = await preload(await requestUrl())
    } catch {
      // Nothing lined up; fetchDog will just request one the usual way.
      queued = null
    }
  }

  return { image, breed, loading, error, fetchDog, prefetchNext }
}

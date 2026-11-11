import { ref } from 'vue'
import { breedFromSlug } from '../utils/breed'

const BREED_LIST_URL = 'https://dog.ceo/api/breeds/list/all'

/* Fetched once per page load and shared by every caller. */
let cache = null

/**
 * Every breed the Dog API can return, as the same display names the kennel
 * stores, so the two can be compared directly.
 *
 * The API groups sub-breeds under their parent; a dog's identity is the
 * combination, so "bulldog" with sub-breeds becomes three entries, not one.
 */
async function loadCatalog () {
  const response = await fetch(BREED_LIST_URL)
  if (!response.ok) throw new Error(`Breed list responded ${response.status}`)

  const { message } = await response.json()

  return Object.keys(message)
    .sort()
    .flatMap(breed => (
      message[breed].length
        ? message[breed].map(sub => `${breed}-${sub}`)
        : [breed]
    ))
    .map(breedFromSlug)
    .sort((a, b) => a.localeCompare(b))
}

export function useBreedCatalog () {
  const catalog = ref(cache ?? [])
  const ready = ref(Boolean(cache))

  if (!cache) {
    loadCatalog()
      .then(list => {
        cache = list
        catalog.value = list
        ready.value = true
      })
      .catch(() => {
        // Without the catalog the progress meter simply does not render.
        ready.value = false
      })
  }

  return { catalog, ready }
}

import { ref, computed, watch } from 'vue'
import { breedFromUrl } from '../utils/breed'

const STORAGE_KEY = 'dogtastic:kennel'

/** localStorage throws in private windows and when site data is blocked. */
function readStoredRoster () {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    // Drop anything that does not look like a dog, so one bad write cannot
    // break every future visit.
    return parsed
      .filter(dog => dog && typeof dog.name === 'string' && typeof dog.image === 'string')
      // Dogs stored before breeds existed have no breed field; derive it
      // from the image URL rather than making anyone clear their kennel.
      .map(dog => ({ ...dog, breed: dog.breed ?? breedFromUrl(dog.image) }))
  } catch {
    return []
  }
}

/**
 * The kennel roster, persisted to localStorage so it survives a refresh.
 */
export function useKennel () {
  const roster = ref(readStoredRoster())

  watch(roster, current => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    } catch {
      // Out of quota or storage unavailable: the kennel still works for
      // this session, it just will not come back.
    }
  }, { deep: true })

  const count = computed(() => roster.value.length)

  const breedCount = computed(
    () => new Set(roster.value.map(dog => dog.breed).filter(Boolean)).size
  )

  function add ({ name, image, breed }) {
    roster.value.unshift({
      // A stable id per dog, so removing one of two dogs that happen to
      // share a name removes exactly the one that was clicked.
      id: crypto.randomUUID(),
      name,
      image,
      breed: breed ?? breedFromUrl(image)
    })
  }

  function remove (dog) {
    roster.value = roster.value.filter(kennelDog => kennelDog.id !== dog.id)
  }

  function clear () {
    roster.value = []
  }

  return { roster, count, breedCount, add, remove, clear }
}

import { ref, watch } from 'vue'

/**
 * Tracks whether an image URL actually loads.
 *
 * The portraits and cards paint their photo with background-image, which
 * fires no load or error event, so a dead URL just left an empty tile.
 * Loading the same URL through an Image element gives us those events; the
 * browser serves the real element from cache, so this costs no extra
 * request.
 *
 * @param {import('vue').Ref<string>|(() => string)} source
 */
export function useImageStatus (source) {
  const status = ref('idle')

  watch(source, (src, _previous, onCleanup) => {
    if (!src) {
      status.value = 'idle'
      return
    }

    status.value = 'loading'

    const probe = new Image()
    let stale = false

    probe.onload = () => { if (!stale) status.value = 'loaded' }
    probe.onerror = () => { if (!stale) status.value = 'error' }
    probe.src = src

    // A newer src arrived (or the component went away) before this one
    // settled; ignore whatever it reports.
    onCleanup(() => { stale = true })
  }, { immediate: true })

  return { status }
}

/**
 * Turns a Dog API image URL into a readable breed name.
 *
 * The breed is already sitting in every URL the API returns:
 *   https://images.dog.ceo/breeds/bullterrier-staffordshire/n02093256.jpg
 *                                 ^^^^^^^^^^^^^^^^^^^^^^^^
 * so this costs no extra request.
 */

/* Slugs that are compound words. Everything else is a single word that
   title-cases correctly on its own (weimaraner, rottweiler, affenpinscher). */
const TOKEN_LABELS = {
  bullterrier: 'Bull Terrier',
  cattledog: 'Cattle Dog',
  cotondetulear: 'Coton de Tulear',
  danishswedish: 'Danish-Swedish',
  mexicanhairless: 'Mexican Hairless',
  pitbull: 'Pit Bull',
  sharpei: 'Shar Pei',
  shihtzu: 'Shih Tzu',
  stbernard: 'St. Bernard',
  waterdog: 'Water Dog',

  // Compound sub-breed tokens
  flatcoated: 'Flat-Coated',
  germanlonghair: 'German Longhair',
  kerryblue: 'Kerry Blue',
  westhighland: 'West Highland'
}

/* Slugs are normally breed-first, but a handful lead with the modifier:
   "german-shepherd" is a German Shepherd, not a Shepherd German. */
const MODIFIER_FIRST = new Set([
  'african', 'australian', 'danishswedish', 'finnish', 'german', 'rough'
])

/* Whole slugs whose natural name is not just their parts rearranged. */
const SLUG_LABELS = {
  'african-wild': 'African Wild Dog',
  'mountain-bernese': 'Bernese Mountain Dog',
  'mountain-swiss': 'Greater Swiss Mountain Dog',
  mix: 'Mixed Breed'
}

function labelFor (token) {
  return TOKEN_LABELS[token] ?? token.charAt(0).toUpperCase() + token.slice(1)
}

export function breedFromSlug (slug) {
  if (!slug) return null
  if (SLUG_LABELS[slug]) return SLUG_LABELS[slug]

  const parts = slug.split('-')

  // The API writes these breed-first, but they read sub-breed-first:
  // "bullterrier-staffordshire" is a Staffordshire Bull Terrier.
  if (!MODIFIER_FIRST.has(parts[0])) parts.reverse()

  return parts.map(labelFor).join(' ')
}

export function breedFromUrl (url) {
  const match = /\/breeds\/([^/]+)\//.exec(url ?? '')
  return match ? breedFromSlug(match[1]) : null
}

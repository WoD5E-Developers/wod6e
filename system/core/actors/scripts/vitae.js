import { generationDetailLookup } from '../../../splats/vampire/scripts/generation-detail-lookup.js'

export function hasBeast(actor) {
  const type = String(actor?.system?.creatureType || actor?.type || '')
    .trim()
    .toLowerCase()
  return ['vampire', 'duskborn'].includes(type)
}

export function generateVitaeMax(actor) {
  const type = String(actor?.system?.creatureType || actor?.type || '')
    .trim()
    .toLowerCase()
  if (type === 'ghoul') return 5
  if (!hasBeast(actor)) return 0
  const generation = actor.system.vampire?.generation?.value ?? 13
  const modifier = generationDetailLookup(generation)?.modifier ?? 1
  // The published PC table ends at elders; do not extrapolate the legacy Methuselah placeholder.
  return 5 + 5 * Math.min(modifier, 3)
}

// PG 103: full Vitae is Hunger 0; the first spent point starts the next band.
export function hungerFromVitae(value, maximum) {
  if (maximum <= 5) return 0
  const remaining = Math.max(0, Math.min(maximum, Number(value) || 0))
  return Math.min(5, Math.ceil((maximum - remaining) / (maximum / 5)))
}

export function getHunger(actor, vitae = actor?.system?.vitae?.value) {
  if (!hasBeast(actor) || !actor?.system?.vitae) return 0
  return hungerFromVitae(vitae, generateVitaeMax(actor))
}

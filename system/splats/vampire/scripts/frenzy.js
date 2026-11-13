import { getHunger } from '../../../core/actors/scripts/vitae.js'
import { generationDetailLookup } from './generation-detail-lookup.js'

export const RAGE_MODIFIERS = [
  ['AllyHarmed', 1],
  ['AllyKilled', 2],
  ['LovedOneHarmed', 2],
  ['LovedOneKilled', 3],
  ['Inferior', 1],
  ['Superior', -1],
  ['Respected', -2],
  ['Enemy', 1],
  ['Humiliated', 1]
]

export function getFrenzyDifficulty(actor, type, { fear = 2, rage = [] } = {}) {
  if (type === 'hunger') return getHunger(actor)
  if (type === 'clan')
    return 3 + (generationDetailLookup(actor.system.vampire.generation.value)?.modifier ?? 1)
  if (type === 'fear') return Math.max(1, Math.min(5, Number(fear) || 2))
  if (type === 'rage')
    return Math.max(
      0,
      2 + [...new Set(rage)].reduce((total, index) => total + (RAGE_MODIFIERS[index]?.[1] ?? 0), 0)
    )
  throw new Error('Unknown frenzy type')
}

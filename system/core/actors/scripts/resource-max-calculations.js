import { NpcTiers } from '../../config/npc-tiers.js'
import { createInitialAttributeValue } from '../data-models/fields/attribute-fields.js'

export function getNpcResourceDefaults(system) {
  const { tier, creatureKind, attributePools, attributes } = system
  if (NpcTiers.getDefinition(tier).usesDetailedTraits) {
    const { value: initialRank } = createInitialAttributeValue()
    const stamina = attributes?.stamina?.value ?? initialRank
    const composure = attributes?.composure?.value ?? initialRank
    const resolve = attributes?.resolve?.value ?? initialRank
    return {
      health: 5 + stamina,
      willpower: Math.max(1, composure + resolve)
    }
  }

  const { physical, social, mental } = attributePools
  const healthBase = creatureKind === 'vampire' ? 5 : 2
  let health = healthBase + Math.ceil(physical / 2)

  if (creatureKind === 'animal') health = Math.max(1, physical)

  if (tier === 'minion' || (tier === 'minor' && system.minion)) health = 1

  return { health, willpower: Math.max(1, social, mental) }
}

export function generateHealthMax(actor) {
  if (actor.type === 'npc') {
    return actor.system.isMinion ? 1 : actor.system.health.max
  }

  const stamina = actor.system.attributes?.stamina?.value

  // Custom actor types without Attributes retain their configured maximum
  if (!Number.isFinite(stamina)) return actor.system.health?.max ?? 1

  const healthMaximum = 5 + stamina

  return healthMaximum
}

export function generateWillpowerMax(actor) {
  if (actor.type === 'npc') return actor.system.willpower.max

  const composure = actor.system.attributes?.composure?.value
  const resolve = actor.system.attributes?.resolve?.value

  // Custom actor types without Attributes retain their configured maximum
  if (!Number.isFinite(composure) || !Number.isFinite(resolve)) {
    return actor.system.willpower?.max ?? 1
  }
  const willpowerMaximum = composure + resolve

  return willpowerMaximum
}

import { generationDetailLookup } from '../../../splats/vampire/scripts/generation-detail-lookup.js'

/** Resolve a configured flat or actor-derived modifier to a finite number. */
export function resolveModifierValue(actor, modifier = {}) {
  if (!['trait', 'sourceTrait'].includes(modifier.valueSource)) {
    return finiteNumber(modifier.value)
  }

  const valueActor =
    modifier.valueSource === 'sourceTrait' ? resolveSourceActor(modifier.sourceActorUuid) : actor

  if (!valueActor || !modifier.valueTrait) return 0

  if (modifier.valueTrait === 'system.vampire.generation.modifier') {
    return finiteNumber(
      generationDetailLookup(valueActor.system?.vampire?.generation?.value)?.modifier
    )
  }

  if (modifier.valueTrait.startsWith('resource:')) {
    const resourceType = modifier.valueTrait.slice('resource:'.length)
    const resource = valueActor.items?.find(
      (item) => item.type === 'resource' && item.system?.resourceType === resourceType
    )
    return finiteNumber(resource?.system?.value)
  }

  const trait = foundry.utils.getProperty(valueActor, modifier.valueTrait)
  if (trait && typeof trait === 'object') {
    return finiteNumber(trait.effective ?? trait.value ?? trait.current)
  }

  return finiteNumber(trait)
}

function resolveSourceActor(uuid) {
  if (!uuid) return null

  const document = globalThis.fromUuidSync?.(uuid) ?? game.actors?.get?.(uuid)
  return document?.actor ?? document
}

function finiteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

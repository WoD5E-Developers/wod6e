import { NpcTiers } from '../../config/npc-tiers.js'

function getNpcTier(actor) {
  const tiers = NpcTiers.getList({})

  return tiers[actor.system.tier] ?? tiers.standard
}

function generateNpcResourceMax(actor, levelKeys, multiplier) {
  const highestLevel = Math.max(...levelKeys.map((key) => actor.system.level[key]))

  return highestLevel * multiplier
}

export function generateHealthMax(actor) {
  if (actor.type === 'npc') {
    const tier = getNpcTier(actor)

    if (!tier.showHealth) return 0

    return generateNpcResourceMax(actor, tier.healthLevels, tier.healthMultiplier)
  }

  const stamina = actor.system.attributes?.stamina?.value

  // Custom actor types without Attributes retain their configured maximum
  if (!Number.isFinite(stamina)) return actor.system.health?.max ?? 1

  const healthMaximum = 10 + stamina

  return healthMaximum
}

export function generateWillpowerMax(actor) {
  if (actor.type === 'npc') {
    const tier = getNpcTier(actor)

    if (!tier.showWillpower) return 0

    return generateNpcResourceMax(actor, tier.willpowerLevels, tier.willpowerMultiplier)
  }

  const composure = actor.system.attributes?.composure?.value
  const resolve = actor.system.attributes?.resolve?.value

  // Custom actor types without Attributes retain their configured maximum
  if (!Number.isFinite(composure) || !Number.isFinite(resolve)) {
    return actor.system.willpower?.max ?? 1
  }
  const willpowerMaximum = 5 + composure + resolve

  return willpowerMaximum
}

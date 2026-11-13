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

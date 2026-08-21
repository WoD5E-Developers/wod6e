export function generateHealthMax(actor) {
  const stamina = actor.system.attributes?.stamina?.value

  // NPCs do not have Attributes, so their configured health maximum is used
  if (!Number.isFinite(stamina)) return actor.system.health?.max ?? 1

  const healthMaximum = 10 + stamina

  return healthMaximum
}

export function generateWillpowerMax(actor) {
  const composure = actor.system.attributes?.composure?.value
  const resolve = actor.system.attributes?.resolve?.value

  // Same here - NPCs don't have attributes, so their configured willpower
  // maximum is used
  if (!Number.isFinite(composure) || !Number.isFinite(resolve)) {
    return actor.system.willpower?.max ?? 1
  }
  const willpowerMaximum = 5 + composure + resolve

  return willpowerMaximum
}

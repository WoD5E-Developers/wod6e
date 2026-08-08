export function generateHealthMax(actor) {
  const stamina = actor.system.attributes.stamina.value
  const healthMaximum = 10 + stamina

  return healthMaximum
}

export function generateWillpowerMax(actor) {
  const composure = actor.system.attributes.composure.value
  const resolve = actor.system.attributes.resolve.value
  const willpowerMaximum = 5 + composure + resolve

  return willpowerMaximum
}

const pendingActors = new Set()

export function getItemCost(item) {
  const cost = item?.system?.activation?.cost
  if (!cost || cost.type === 'none' || !cost.amount) return null
  return { resource: cost.type, amount: cost.amount }
}

export function canPayCost(actor, cost) {
  return (
    !cost ||
    (['health', 'vitae', 'willpower'].includes(cost.resource) &&
      Number.isInteger(cost.amount) &&
      cost.amount > 0 &&
      (actor?.system?.[cost.resource]?.value ?? 0) >= cost.amount)
  )
}

export async function withResourceSpend(actor, cost, operation) {
  if (!cost) return operation()
  if (!actor?.isOwner || pendingActors.has(actor.uuid) || !canPayCost(actor, cost)) {
    throw new Error(game.i18n.localize('WOD6E.RESOURCES.CostUnavailable'))
  }
  pendingActors.add(actor.uuid)
  const path = `system.${cost.resource}.value`
  let spent = false
  try {
    await actor.update({ [path]: actor.system[cost.resource].value - cost.amount })
    spent = true
    return await operation()
  } catch (error) {
    if (spent) {
      const current = actor.system[cost.resource]
      await actor.update({
        [path]: Math.min(current.max - (current.disabled ?? 0), current.value + cost.amount)
      })
    }
    throw error
  } finally {
    pendingActors.delete(actor.uuid)
  }
}

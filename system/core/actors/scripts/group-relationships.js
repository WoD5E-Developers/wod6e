export async function createRelationship(event) {
  event.preventDefault()
  if (!this.actor.isOwner) return false

  const relationships = this.actor.toObject().system.relationships ?? []
  relationships.push({
    id: foundry.utils.randomID(8),
    name: game.i18n.localize('WOD6E.GROUPS.NewRelationship'),
    memberUuids: [],
    description: ''
  })

  await this.actor.update({ 'system.relationships': relationships })
  return true
}

export async function deleteRelationship(event, target) {
  event.preventDefault()
  if (!this.actor.isOwner) return false

  const relationshipId = target.dataset.relationshipId
  const relationships = (this.actor.toObject().system.relationships ?? []).filter(
    (relationship) => relationship.id !== relationshipId
  )

  await this.actor.update({ 'system.relationships': relationships })
  return true
}

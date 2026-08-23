import { ActorUX } from './actor-ux.js'

export async function dropPooledResource(event, group, data) {
  if (!group.isOwner) return false

  const item = await Item.implementation.fromDropData(data)
  if (!item || item.type !== 'resource') {
    ui.notifications.warn(game.i18n.localize('WOD6E.GROUPS.OnlyResourcesAllowed'))
    return false
  }

  if (item.parent?.uuid === group.uuid) return ActorUX._onDropItem(event, group, data)

  const itemData = item.toObject()
  const members = new Set(group.system.members ?? [])
  itemData.system.contributedByUuid = members.has(item.parent?.uuid) ? item.parent.uuid : ''

  return ActorUX._onDropItemCreate(group, itemData)
}

export async function updateResourceContributor(group, itemId, actorUuid) {
  if (!group.isOwner) return false

  const item = group.items.get(itemId)
  if (!item || item.type !== 'resource') return false

  const members = new Set(group.system.members ?? [])
  const contributedByUuid = members.has(actorUuid) ? actorUuid : ''
  await item.update({ 'system.contributedByUuid': contributedByUuid })
  return true
}

export async function deletePooledResource(event, target) {
  event.preventDefault()
  if (!this.actor.isOwner) return false

  await this.actor.deleteEmbeddedDocuments('Item', [target.dataset.itemId])
  return true
}

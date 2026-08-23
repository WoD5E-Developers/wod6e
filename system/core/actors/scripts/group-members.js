export async function addGroupMember(group, actorUuid) {
  if (!group.isOwner) return false

  const actor = fromUuidSync(actorUuid)
  if (!actor || actor.documentName !== 'Actor' || actor.type === 'group') return false

  const members = Array.from(group.system.members ?? [])
  if (members.includes(actor.uuid)) {
    ui.notifications.warn(game.i18n.format('WOD6E.GROUPS.MemberAlreadyAdded', { name: actor.name }))
    return false
  }

  await group.update({ 'system.members': [...members, actor.uuid] })
  return true
}

export async function removeGroupMember(event, target) {
  event.preventDefault()
  if (!this.actor.isOwner) return false

  const actorUuid = target.dataset.uuid
  const members = Array.from(this.actor.system.members ?? []).filter((uuid) => uuid !== actorUuid)

  await this.actor.update({ 'system.members': members })
  return true
}

export async function openGroupMember(event, target) {
  event.preventDefault()
  const actor = fromUuidSync(target.dataset.uuid)
  actor?.sheet?.render(true)
}

export async function resolveGroupMembers(group) {
  const members = []

  for (const uuid of group.system.members ?? []) {
    const actor = fromUuidSync(uuid)
    const player = game.users.find((user) => user.character?.uuid === uuid)

    members.push({
      uuid,
      id: actor?.id ?? '',
      name: actor?.name ?? game.i18n.localize('WOD6E.GROUPS.MissingActor'),
      img: actor?.img ?? 'icons/svg/mystery-man.svg',
      type: actor?.type ?? '',
      typeLabel: actor ? game.i18n.localize(`TYPES.Actor.${actor.type}`) : '',
      quickening: player ? Number(player.getFlag('wod6e', 'quickening') ?? 0) : null,
      hasPlayer: Boolean(player),
      exists: Boolean(actor),
      canOpen: Boolean(actor?.sheet)
    })
  }

  return members
}

export function rerenderGroupsForUser(user) {
  const actorUuid = user.character?.uuid
  if (!actorUuid) return

  for (const group of game.actors.filter((actor) => actor.type === 'group')) {
    if (!Array.from(group.system.members ?? []).includes(actorUuid)) continue

    group.sheet?.render()
  }
}

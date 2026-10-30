export function prepareGroupDirectory(tree, actors, user, expandedGroups = new Set()) {
  const groups = Object.create(null)
  const representedMembers = new Set()
  const worldActors = new Map(actors.map((actor) => [actor.uuid, actor]))

  function collectGroups(node) {
    for (const actor of node.entries) {
      if (actor.type !== 'group' || !actor.visible) continue

      const showMembers =
        actor.testUserPermission(user, 'OBSERVER') ||
        actor.system.settings?.limited?.members === true
      const members = showMembers
        ? Array.from(new Set(actor.system.members ?? []))
            .map((uuid) => worldActors.get(uuid))
            .filter((member) => member?.visible && member.type !== 'group' && !member.isToken)
        : []

      groups[actor.id] = {
        id: actor.id,
        name: actor.name,
        img: actor.img,
        expanded: expandedGroups.has(actor.id),
        showMembers,
        members
      }
      for (const member of members) representedMembers.add(member.uuid)
    }
    for (const child of node.children) collectGroups(child)
  }

  function projectTree(node) {
    return {
      ...node,
      entries: node.entries.filter((actor) => actor.visible && !representedMembers.has(actor.uuid)),
      children: node.children.map(projectTree)
    }
  }

  collectGroups(tree)
  return { tree: projectTree(tree), groups }
}

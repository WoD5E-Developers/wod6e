export function getGroupLabel(type) {
  const labels = {
    attribute: 'WOD6E.ATTRIBUTES.Attributes',
    skill: 'WOD6E.SKILLS.Skills',
    discipline: 'WOD6E.VAMPIRE.Disciplines',
    resource: 'WOD6E.RESOURCES.Resources',
    item: 'WOD6E.ITEMS.Items'
  }

  return game.i18n.localize(labels[type] ?? type)
}

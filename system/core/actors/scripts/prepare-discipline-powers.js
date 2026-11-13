import { generateTestTextFromItem } from '../../items/scripts/generate-test-text-from-item.js'
import { getItemCost } from './resource-spending.js'

export function prepareDisciplinePowers(actor, key) {
  const costs = WOD6E.configs.CostTypes.getList({})
  const attributes = WOD6E.configs.AttributeGroups.getList({})

  return actor.items
    .filter((item) => item.type === 'discipline' && item.system.disciplineType === key)
    .sort((a, b) => a.sort - b.sort)
    .map((item) => {
      const cost = getItemCost(item, actor)
      const resource = costs[cost?.resource]?.label
      const attribute = attributes[item.system.attribute]?.label
      return {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        level: item.system.level,
        testText: generateTestTextFromItem(item),
        cost: resource
          ? game.i18n.format('WOD6E.ITEMS.NumberStringResourceCost', {
              number: cost.amount,
              string: game.i18n.localize(resource)
            })
          : game.i18n.localize('WOD6E.None'),
        attribute: attribute ? game.i18n.localize(attribute) : ''
      }
    })
}

import { generateTrackers } from './generate-trackers.js'

export function prepareResources(actor) {
  const preparedResources = actor.items
    .filter((item) => item.type === 'resource')
    .sort((a, b) => a.sort - b.sort)
    .map((item) => {
      const itemData = item.system
      const value = itemData?.dots?.value ?? 0
      const max = itemData?.dots?.max ?? 5

      const trackers = generateTrackers({
        name: item.name,
        value,
        max,
        groupSize: 5
      })

      return {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        path: `system.dots.value`,
        value,
        trackers
      }
    })

  return preparedResources
}

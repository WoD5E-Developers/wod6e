import { generateTrackers } from './generate-trackers.js'

export function prepareResources(actor) {
  const preparedResources = actor.items
    .filter((item) => item.type === 'resource')
    .map((item) => {
      const itemData = item.system
      const value = itemData?.dots?.value ?? 0
      const max = itemData?.dots?.max ?? 5
      const specialties = itemData?.specialties ?? []

      const trackers = generateTrackers({
        name: item.name,
        value,
        max,
        groupSize: 5
      })

      return {
        uuid: item.uuid,
        name: item.name,
        path: `system.dots.value`,
        value,
        specialties,
        specialtyText: specialties.join(', '),
        trackers
      }
    })

  return preparedResources
}

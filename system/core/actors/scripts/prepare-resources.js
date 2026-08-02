import { generateTrackers } from './generate-trackers.js'

export function prepareResources(actor) {
  const actorResources = actor?.system?.resources || {}

  const preparedResources = Object.entries(actorResources)
    .filter(([, resource]) => !resource.hidden)
    .map(([key, resource]) => {
      const actorResource = actorResources[key]
      const value = actorResource?.value ?? 0
      const specialties = actorResource?.specialties ?? []

      const trackers = generateTrackers({
        name: resource.displayName,
        value,
        max: 5,
        groupSize: 5
      })

      return {
        key,
        label: resource.displayName,
        path: `system.resources.${key}.value`,
        value,
        specialties,
        specialtyText: specialties.join(', '),
        trackers
      }
    })

  return preparedResources
}

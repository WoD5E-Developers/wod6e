import { generateTrackers } from './generate-trackers.js'

export function prepareSkills(actor) {
  const skills = WOD6E.Skills.getList({})
  const actorSkills = actor?.system?.skills || {}

  const preparedSkills = Object.entries(skills)
    .filter(([, skill]) => !skill.hidden)
    .map(([key, skill]) => {
      const actorSkill = actorSkills[key]
      const value = actorSkill?.value ?? 0
      const specialties = actorSkill?.specialties ?? []

      const trackers = generateTrackers({
        name: skill.displayName,
        value,
        max: 5,
        groupSize: 5
      })

      return {
        key,
        label: skill.displayName,
        path: `system.skills.${key}.value`,
        value,
        specialties,
        specialtyText: specialties.join(', '),
        trackers
      }
    })

  return preparedSkills
}

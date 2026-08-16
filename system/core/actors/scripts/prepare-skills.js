import { generateTrackers } from './generate-trackers.js'

export function prepareSkills(actor) {
  const skills = WOD6E.configs.Skills.getList({})
  const actorSkills = actor?.system?.skills || {}

  const preparedSkills = Object.entries(skills)
    .filter(([, skill]) => !skill.hidden)
    .map(([key, skill]) => {
      const actorSkill = actorSkills[key]
      const value = actorSkill?.effective ?? 0
      const focuses = actorSkill?.focuses ?? []

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
        focuses,
        focusesText: focuses.join(', '),
        trackers
      }
    })

  return preparedSkills
}

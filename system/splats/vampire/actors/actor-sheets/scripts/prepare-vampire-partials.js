import { generateTrackers } from '../../../../../core/actors/scripts/generate-trackers.js'
import { prepareSkills } from '../../../../../core/actors/scripts/prepare-skills.js'

export const prepareHeaderContext = async function (context, actor) {
  const actorData = actor.system

  context.name = actor.name
  context.archetype = actorData.archetype
  context.age = actorData.age
  context.vampire = actorData.vampire

  return context
}

export const prepareHumanityScaleContext = async function (context, actor) {
  const actorData = actor.system
  const humanity = actorData.vampire.humanity

  context.humanity = {
    trackers: generateTrackers({
      name: game.i18n.localize('WOD6E.VAMPIRE.Humanity'),
      value: humanity.value,
      max: humanity.max,
      groupSize: 100,
      onlyCurrentValueSelected: true
    })
  }

  return context
}

export const prepareLeftColumnContext = async function (context, actor) {
  context.skills = prepareSkills(actor)

  return context
}

export const prepareMiddleColumnContext = async function (context) {
  context.equipment = []

  return context
}

export const prepareRightColumnContext = async function (context) {
  context.lifepaths = []

  context.clanTraits = []

  context.merits = []

  context.flaws = []

  context.nature = []

  context.beast = []

  return context
}

export const prepareDisciplinesContext = async function (context) {
  context.disciplines = []

  return context
}

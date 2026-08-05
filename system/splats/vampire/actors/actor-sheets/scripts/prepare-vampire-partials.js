import { generateTrackers } from '../../../../../core/actors/scripts/generate-trackers.js'
import { prepareResources } from '../../../../../core/actors/scripts/prepare-resources.js'
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
  context.resources = prepareResources(actor)

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

  const nature = context.nature
  const natureData = nature?.system || {}
  context.nature = [
    {
      name: `${nature?.name}`,
      description: natureData?.description
    },
    {
      name: `${nature?.name} Outburst: ${natureData?.outburst?.name}`,
      description: natureData?.outburst?.description
    }
  ]

  const clan = context.clan
  const clanData = clan?.system || {}
  context.beast = [
    {
      name: `${clan?.name} Beast: ${clanData?.beast?.name}`,
      description: clanData?.beast?.description
    },
    {
      name: `${clan?.name} Frenzy: ${clanData?.frenzy?.name}`,
      description: clanData?.frenzy?.description
    }
  ]

  return context
}

export const prepareDisciplinesContext = async function (context) {
  context.disciplines = []

  return context
}

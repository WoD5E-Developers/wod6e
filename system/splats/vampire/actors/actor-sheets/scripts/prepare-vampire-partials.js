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

export const prepareMiddleColumnContext = async function (context, actor) {
  const equipment = actor.items.filter((item) => item.type === 'equipment')
  context.equipment = await Promise.all(
    equipment.map(async (item) => ({
      uuid: item.uuid,
      name: item.name,
      img: item.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        item.system.description ?? ''
      )
    }))
  )

  return context
}

export const prepareRightColumnContext = async function (context, actor) {
  const lifepaths = actor.items.filter((item) => item.type === 'lifepath')
  context.lifepaths = await Promise.all(
    lifepaths.map(async (lifepath) => ({
      uuid: lifepath.uuid,
      name: lifepath.name,
      img: lifepath.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        lifepath.system.description ?? ''
      )
    }))
  )

  const clanTraits = actor.items.filter((item) => item.type === 'clanTrait')
  context.clanTraits = await Promise.all(
    clanTraits.map(async (clanTrait) => ({
      uuid: clanTrait.uuid,
      name: clanTrait.name,
      img: clanTrait.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        clanTrait.system.description ?? ''
      )
    }))
  )

  const merits = actor.items.filter((item) => item.type === 'merit')
  context.merits = await Promise.all(
    merits.map(async (merit) => ({
      uuid: merit.uuid,
      name: merit.name,
      img: merit.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        merit.system.description ?? ''
      )
    }))
  )

  const flaws = actor.items.filter((item) => item.type === 'flaw')
  context.flaws = await Promise.all(
    flaws.map(async (flaw) => ({
      uuid: flaw.uuid,
      name: flaw.name,
      img: flaw.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        flaw.system.description ?? ''
      )
    }))
  )

  const nature = context.nature
  if (nature) {
    const natureData = nature?.system || {}
    context.natureFeatures = [
      {
        uuid: nature?.uuid,
        name: `${nature?.name}`,
        img: nature?.img,
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          natureData?.description ?? ''
        )
      },
      {
        uuid: nature?.uuid,
        name: `${nature?.name} Outburst: ${natureData?.outburst?.name || 'None'}`,
        img: nature?.img,
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          natureData?.outburst?.description ?? ''
        )
      }
    ]
  } else {
    context.nature = []
  }

  const clan = context.clan
  if (clan) {
    const clanData = clan?.system || {}
    context.beast = [
      {
        uuid: clan?.uuid,
        name: `${clan?.name} Beast: ${clanData?.beast?.name || 'None'}`,
        img: clan?.img,
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          clanData?.beast?.description ?? ''
        )
      },
      {
        uuid: clan?.uuid,
        name: `${clan?.name} Frenzy: ${clanData?.frenzy?.name || 'None'}`,
        img: clan?.img,
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          clanData?.frenzy?.description ?? ''
        )
      }
    ]
  } else {
    context.beast = [
      {
        name: 'No clan chosen'
      }
    ]
  }

  return context
}

export const prepareDisciplinesContext = async function (context) {
  context.disciplines = []

  return context
}

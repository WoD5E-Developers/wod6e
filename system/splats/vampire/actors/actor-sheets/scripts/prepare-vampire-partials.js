import { generateTrackers } from '../../../../../core/actors/scripts/generate-trackers.js'
import { prepareResources } from '../../../../../core/actors/scripts/prepare-resources.js'
import { prepareSkills } from '../../../../../core/actors/scripts/prepare-skills.js'
import { generateTestTextFromItem } from '../../../../../core/items/scripts/generate-test-text-from-item.js'
import { formatOrdinals } from '../../../../../core/scripts/format-ordinals.js'

export const prepareHeaderContext = async function (context, actor) {
  const actorData = actor.system
  const clan = context.clan

  context.name = actor.name
  context.archetype = actorData.archetype
  context.age = actorData.age
  context.vampire = actorData.vampire
  if (clan) {
    context.curse = clan?.system?.curse?.name ? clan?.system?.curse?.name : `${clan?.name} Curse`
  }

  // Construct how the labels should look by giving all the generation options as dropdowns
  context.generationOptions = Object.values(WOD6E.configs.GenerationCategories.getList({}))
    .flatMap((category) =>
      category.generations.map((generation) => ({
        value: generation,
        label: `${formatOrdinals(generation)} - ${category.label} (${category.modifier})`
      }))
    )
    .sort((a, b) => b.value - a.value)

  context.generationSelected = actorData.vampire.generation.value

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

  const nature = actorData.vampire.nature
  context.natureTracker = {
    trackers: generateTrackers({
      name: game.i18n.localize('WOD6E.VAMPIRE.Nature'),
      value: nature.value,
      max: nature.max,
      groupSize: 5
    })
  }

  const beast = actorData.vampire.beast
  context.beastTracker = {
    trackers: generateTrackers({
      name: game.i18n.localize('WOD6E.VAMPIRE.Beast'),
      value: beast.value,
      max: beast.max,
      groupSize: 5,
      reverse: true
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

export function prepareDisciplinesContext(context, actor) {
  const disciplines = WOD6E.configs.Disciplines.getList({})
  const actorDisciplines = actor?.system?.vampire?.disciplines || {}

  const preparedDisciplines = Object.entries(disciplines)
    .filter(([key, discipline]) => !discipline?.hidden && actorDisciplines[key]?.visible)
    .map(([key, discipline]) => {
      const actorDiscipline = actorDisciplines[key]
      const value = actorDiscipline?.value ?? 0
      const effective = actorDiscipline?.effective ?? 0
      const max = actorDiscipline?.max ?? 5
      const powers = actor.items
        .filter((item) => item.type === 'discipline' && item.system?.disciplineType === key)
        .map((item) => ({
          ...item,
          uuid: item.uuid,
          testText: generateTestTextFromItem(item),
          cost:
            item.system?.activation?.cost?.type === 'none'
              ? game.i18n.localize('WOD6E.None')
              : game.i18n.format('WOD6E.ITEMS.NumberStringResourceCost', {
                  number: item.system?.activation?.cost?.amount,
                  string: WOD6E.configs.CostTypes.getList({})[item.system?.activation?.cost?.type]
                    .label
                }),
          attribute: WOD6E.configs.AttributeGroups.getList({})[item.system?.attribute].label
        }))

      const trackers = generateTrackers({
        name: discipline.displayName,
        value,
        effective,
        max,
        groupSize: 5
      })

      return {
        key,
        label: discipline.displayName,
        path: `system.vampire.disciplines.${key}.value`,
        value,
        powers,
        trackers
      }
    })

  context.disciplines = preparedDisciplines

  return context
}

import { generateTrackers } from '../../../../../core/actors/scripts/generate-trackers.js'
import { prepareResources } from '../../../../../core/actors/scripts/prepare-resources.js'
import { prepareSkills } from '../../../../../core/actors/scripts/prepare-skills.js'
import { prepareDisciplinePowers } from '../../../../../core/actors/scripts/prepare-discipline-powers.js'
import { formatOrdinals } from '../../../../../core/scripts/format-ordinals.js'
import { generationDetailLookup } from '../../../scripts/generation-detail-lookup.js'
import { getActivePath, getHumanityRank, getHumanityModifier } from '../../../scripts/humanity.js'
import { hasBeast } from '../../../../../core/actors/scripts/vitae.js'

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
  const rank = getHumanityRank(actor)
  const path = getActivePath(actor)
  const violations = Math.min(10 - rank, actor.system.vampire.humanity.violations)
  const modifier = getHumanityModifier(rank)
  context.humanity = {
    hasBeast: hasBeast(actor),
    violations,
    modifier: modifier > 0 ? `+${modifier}` : String(modifier),
    name: path.name,
    uuid: path.uuid,
    canEdit: actor.isOwner,
    isWight: rank === 0,
    boxes: Array.from({ length: 10 }, (_unused, index) => ({
      position: index + 1,
      filled: index < rank,
      current: index + 1 === rank,
      violated: index >= 10 - violations,
      title: game.i18n.format('WOD6E.VAMPIRE.SetHumanityRank', { rank: index + 1 })
    }))
  }
  return context
}

export const prepareLeftColumnContext = async function (context, actor) {
  context.skills = prepareSkills(actor)
  context.resources = prepareResources(actor)

  return context
}

export const prepareMiddleColumnContext = async function (context, actor) {
  const equipment = actor.items
    .filter((item) => item.type === 'equipment')
    .sort((a, b) => a.sort - b.sort)
  context.equipment = await Promise.all(
    equipment.map(async (item) => ({
      id: item.id,
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
  const lifepaths = actor.items
    .filter((item) => item.type === 'lifepath')
    .sort((a, b) => a.sort - b.sort)
  context.lifepaths = await Promise.all(
    lifepaths.map(async (lifepath) => ({
      id: lifepath.id,
      uuid: lifepath.uuid,
      name: lifepath.name,
      img: lifepath.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        lifepath.system.description ?? ''
      )
    }))
  )

  const clanTraits = actor.items
    .filter((item) => item.type === 'clanTrait')
    .sort((a, b) => a.sort - b.sort)
  context.clanTraits = await Promise.all(
    clanTraits.map(async (clanTrait) => ({
      id: clanTrait.id,
      uuid: clanTrait.uuid,
      name: clanTrait.name,
      img: clanTrait.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        clanTrait.system.description ?? ''
      )
    }))
  )

  const merits = actor.items.filter((item) => item.type === 'merit').sort((a, b) => a.sort - b.sort)
  context.merits = await Promise.all(
    merits.map(async (merit) => ({
      id: merit.id,
      uuid: merit.uuid,
      name: merit.name,
      img: merit.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        merit.system.description ?? ''
      )
    }))
  )

  const flaws = actor.items.filter((item) => item.type === 'flaw').sort((a, b) => a.sort - b.sort)
  context.flaws = await Promise.all(
    flaws.map(async (flaw) => ({
      id: flaw.id,
      uuid: flaw.uuid,
      name: flaw.name,
      img: flaw.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        flaw.system.description ?? ''
      )
    }))
  )

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
  const generation = actor?.system?.vampire?.generation?.value
  const disciplineMaximums = generationDetailLookup(generation)?.maximumValues?.disciplines
  const clan = actor.items.find((item) => item.type === 'clan')
  const inClanDisciplines = new Set(clan?.system?.disciplines ?? [])

  const preparedDisciplines = Object.entries(disciplines)
    .filter(([key, discipline]) => !discipline?.hidden && actorDisciplines[key]?.visible)
    .map(([key, discipline]) => {
      const actorDiscipline = actorDisciplines[key]
      const value = actorDiscipline?.value ?? 0
      const effective = actorDiscipline?.effective ?? 0
      const clanStatus = inClanDisciplines.has(key) ? 'inClan' : 'nonClan'
      const configuredMaximum = Number(disciplineMaximums?.[clanStatus])
      const max = Number.isFinite(configuredMaximum)
        ? configuredMaximum
        : (actorDiscipline?.max ?? 5)
      const powers = prepareDisciplinePowers(actor, key)

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

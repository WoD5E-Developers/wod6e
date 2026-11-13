import { getHumanityRank } from '../../../splats/vampire/scripts/humanity.js'
import { npcCategories, npcCreatureTypes } from '../data-models/fields/npc-fields.js'
import { prepareLimitedContext, prepareResourcesContext } from './prepare-core-partials.js'
import { prepareDisciplinePowers } from './prepare-discipline-powers.js'

function creatureKindLabel(kind) {
  return game.i18n.localize(`WOD6E.NPC.CreatureTypes.${kind}`)
}

function traitRows(definitions, values, path) {
  return Object.entries(definitions.getList({})).map(([key, definition]) => ({
    key,
    label: definition.displayName ?? game.i18n.localize(definition.label),
    category: definition.type,
    path: `system.${path}.${key}.value`,
    value: values[key]?.value ?? 0,
    focuses: values[key]?.focuses?.join(', ')
  }))
}

export function prepareNpcSkillPools(actor) {
  const pools = actor.system.skillPools
  return traitRows(WOD6E.configs.Skills, pools, 'skillPools').map((skill) => {
    const pool = pools[skill.key]
    const specialization = pool?.specialization ?? ''
    return {
      ...skill,
      specialization,
      active: pool?.active ?? Boolean(skill.value || specialization)
    }
  })
}

export function prepareNpcDisciplines(actor) {
  const disciplines = actor.system.disciplines
  return traitRows(WOD6E.configs.Disciplines, disciplines, 'disciplines').map((discipline) => ({
    ...discipline,
    active: disciplines[discipline.key]?.active ?? discipline.value > 0
  }))
}

export async function prepareNpcAbilitiesContext(context, actor) {
  context.tab = context.tabs.abilities
  context.showDisciplines = ['vampire', 'ghoul'].includes(actor.system.creatureKind)
  if (context.showDisciplines) {
    context.disciplines = prepareNpcDisciplines(actor)
      .filter((discipline) => discipline.active)
      .map((discipline) => ({
        ...discipline,
        powers: prepareDisciplinePowers(actor, discipline.key)
      }))
  }
  context.abilities = actor.items
    .filter((item) => item.type === 'npcAbility')
    .sort((a, b) => a.sort - b.sort)
    .map((ability) => ({
      id: ability.id,
      uuid: ability.uuid,
      name: ability.name,
      description: ability.system.description,
      activation: ability.system.activation.activationType,
      uses: ability.system.uses
    }))

  return context
}

export async function prepareNpcMainContext(context, actor) {
  const system = actor.system
  const configs = WOD6E.configs
  const tiers = configs.NpcTiers.getList({ disableSort: true })
  const tier = system.isMinion ? 'minion' : system.tier
  const { usesDetailedTraits } = configs.NpcTiers.getDefinition(tier)

  context.tierOptions = Object.entries(tiers).map(([value, definition]) => ({
    value,
    label: definition.displayName ?? game.i18n.localize(definition.label)
  }))
  context.creatureKindOptions = npcCreatureTypes.map((value) => ({
    value,
    label: creatureKindLabel(value)
  }))

  context.npc = {
    tier,
    creatureKind: system.creatureKind,
    motivation: system.motivation,
    usesDetailedTraits,
    isVampire: system.creatureKind === 'vampire',
    vampire: system.vampire,
    needsMajorReview: system.legacyNpc?.tier === 'elite' && !usesDetailedTraits
  }

  if (context.npc.isVampire) {
    context.humanityRank = getHumanityRank(actor)
    context.humanityRankOptions = Array.from({ length: 11 }, (_, value) => ({
      value,
      label: String(value)
    }))
  }

  context = await prepareResourcesContext(context, actor)
  context.canAdjustHealthMax = context.isOwner && !system.isMinion
  context.enrichedMotivation = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    system.motivation
  )

  const attributes = usesDetailedTraits
    ? traitRows(configs.Attributes, system.attributes, 'attributes')
    : []
  const groups = configs.AttributeGroups.getList({})
  context.attributeGroups = npcCategories.map((key) => ({
    key,
    label: groups[key]?.displayName ?? game.i18n.localize(groups[key]?.label ?? key),
    pool: system.attributePools[key],
    attributes: attributes.filter((attribute) => attribute.category === key)
  }))
  if (usesDetailedTraits) {
    context.skills = traitRows(configs.Skills, system.skills, 'skills')
  } else {
    const pools = prepareNpcSkillPools(actor).filter((skill) => skill.active)
    const columns = [[], [], []]
    // Keep the existing left-to-right order while each column sizes its own rows.
    pools.forEach((pool, index) => columns[index % columns.length].push(pool))
    context.skillPoolColumns = pools.length ? columns : []
  }

  return context
}

export async function prepareNpcLimitedContext(context, actor) {
  context = await prepareLimitedContext(context, actor)
  const limitedSettings = actor?.system?.settings?.limited ?? {}

  context.npc = {
    creatureType: creatureKindLabel(actor.system.creatureKind),
    motivation: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      actor?.system?.motivation ?? ''
    ),
    showCreatureType: limitedSettings.creatureType,
    showMotivation: limitedSettings.motivation
  }

  return context
}

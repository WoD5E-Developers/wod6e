import { prepareLimitedContext, prepareResourcesContext } from './prepare-core-partials.js'

export async function prepareNpcAbilitiesContext(context, actor) {
  context.tab = context.tabs.abilities
  context.abilities = actor.items
    .filter((item) => item.type === 'npcAbility')
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
  const tiers = WOD6E.configs.NpcTiers.getList({})
  const tier = tiers[system.tier] ? system.tier : 'standard'

  context.tierOptions = Object.entries(tiers).map(([value, definition]) => ({
    value,
    label: definition.displayName ?? game.i18n.localize(definition.label)
  }))
  const selectedTier = tiers[tier]

  context.npc = {
    tier,
    creatureType: system?.creatureType,
    subtype: system?.subtype,
    motivation: system?.motivation,
    defeated: system?.tier === 'minion' ? system?.defeated : false,
    isElite: system?.tier === 'elite',
    showHealth: selectedTier?.showHealth ?? false,
    showWillpower: selectedTier?.showWillpower ?? false
  }

  // Reuse our resource context preparation script here since it's
  // funamentally the exact same thing
  if (context?.npc?.showHealth || context?.npc?.showWillpower) {
    context = await prepareResourcesContext(context, actor)
  }

  context.enrichedMotivation = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    system?.motivation ?? ''
  )

  // Quick mapping for level labels
  const levelLabels = {
    value: 'WOD6E.NPC.Level',
    physical: 'WOD6E.NPC.Physical',
    social: 'WOD6E.NPC.Social',
    mental: 'WOD6E.NPC.Mental'
  }
  // Since levels can either be a single value or multiple, we just
  // need to iterate through all configured and map them correctly
  // for the sheet to display
  context.levels = selectedTier.levels.map((key) => ({
    key,
    label: levelLabels[key],
    value: system?.level[key]
  }))

  return context
}

export async function prepareNpcLimitedContext(context, actor) {
  context = await prepareLimitedContext(context, actor)
  const limitedSettings = actor?.system?.settings?.limited ?? {}

  context.npc = {
    creatureType: actor?.system?.creatureType,
    subtype: actor?.system?.subtype,
    motivation: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      actor?.system?.motivation ?? ''
    ),
    showCreatureType: limitedSettings.creatureType,
    showSubtype: limitedSettings.subtype,
    showMotivation: limitedSettings.motivation
  }

  return context
}

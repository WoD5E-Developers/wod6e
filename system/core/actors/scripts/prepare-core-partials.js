import { generateTrackers } from './generate-trackers.js'
import { getEffectLabel } from './get-effect-label.js'
import { resolveModifierValue } from './resolve-modifier-value.js'

export const prepareAttributesContext = async function (context, actor) {
  const attributeGroups = WOD6E.configs.AttributeGroups.getList({})
  const attributes = WOD6E.configs.Attributes.getList({})

  context.attributeGroups = Object.entries(attributeGroups)
    .filter(([, attributeGroup]) => !attributeGroup.hidden)
    .map(([attributeGroupId, attributeGroup]) => ({
      id: attributeGroupId,
      label: attributeGroup.displayName,
      attributes: Object.entries(attributes)
        .filter(([, attribute]) => attribute.type === attributeGroupId && !attribute.hidden)
        .map(([key, attribute]) => ({
          key,
          label: attribute.displayName,
          value: foundry.utils.getProperty(actor, `${attribute.path}.effective`),
          // We signal that an attribute is modified by an effect by checking if effective and value are different
          // It's lazy but it should work unless bad data gets into the system
          modified:
            foundry.utils.getProperty(actor, `${attribute.path}.effective`) !=
            foundry.utils.getProperty(actor, `${attribute.path}.value`)
        }))
    }))

  return context
}

export const prepareResourcesContext = async function (context, actor) {
  const actorHealth = actor.system.health

  // Switch for the health label; likely as more splats/actor types are added this will
  // have to move to a configuration in ActorTypes, but for now this'll do
  const healthLabel = actor.type === 'npc' ? 'WOD6E.NPC.Health' : 'WOD6E.RESOURCES.Vitae'

  if (actorHealth) {
    context.health = {
      // Other splats may call this "Health" in the future
      // So let's think smartly and just make this a variable
      // upfront instead of putting it on the sheet
      label: healthLabel,
      path: 'system.health.value',
      value: actorHealth.value,
      max: actorHealth.max,
      baneful: actorHealth.baneful,
      trackers: generateTrackers({
        name: game.i18n.localize(healthLabel),
        damageName: game.i18n.localize('WOD6E.RESOURCES.Baneful'),
        value: actorHealth.value,
        max: actorHealth.max,
        disabled: actorHealth.disabled
      })
    }
  }

  const actorWillpower = actor.system.willpower
  if (actorWillpower) {
    context.willpower = {
      path: 'system.willpower.value',
      value: actorWillpower.value,
      max: actorWillpower.max,
      baneful: actorWillpower.baneful,
      trackers: generateTrackers({
        name: game.i18n.localize('WOD6E.RESOURCES.Willpower'),
        value: actorWillpower.value,
        max: actorWillpower.max,
        disabled: actorWillpower.disabled,
        reverse: true
      })
    }
  }

  return context
}

export const prepareActionsContext = async function (context, actor) {
  // Tab data
  context.tab = context.tabs.actions

  // Construct the action groupings
  const actionGroups = WOD6E.configs.ActionGroups.getList({})
  context.actionGroups = Object.entries(actionGroups).map(([key, group]) => ({
    key,
    label: group.label,
    actions: []
  }))
  const groups = new Map(context.actionGroups.map((group) => [group.key, group]))

  // Populate actions
  for (const action of actor.items.filter((item) => item.type === 'action')) {
    const group = action?.system?.group || 'general'

    const actionGroup = groups.get(group)

    if (!actionGroup) continue

    actionGroup.actions.push({
      id: action.id,
      uuid: action.uuid,
      name: action.name,
      description: action.system.description,
      activation: action.system.activation.activationType,
      role: action.system.role,
      type: action.system.actionType
    })
  }

  return context
}

export const prepareConditionsContext = async function (context, actor) {
  context.tab = context.tabs.conditions

  context.conditions = []

  for (const condition of actor.items.filter((item) => item.type === 'condition')) {
    const effects = condition.system?.effects ?? []
    const durations = WOD6E.configs.Durations.getList({})
    const effectTypes = WOD6E.configs.EffectTypes.getList({ usePath: true })

    context.conditions.push({
      id: condition.id,
      uuid: condition.uuid,
      name: condition.name,

      description: condition.system?.description,
      duration: durations[condition.system?.condition?.duration].label,

      effects: effects.map((effect) => ({
        type: effectTypes[effect.type].label,
        targets: Array.from(effect.targets ?? [])
          .map(getEffectLabel)
          .join(', '),
        mode: effect.mode,
        value: resolveModifierValue(actor, {
          ...effect,
          sourceActorUuid: condition.system.condition?.sourceUuid
        }),
        predicates: Array.from(effect.predicates ?? [])
          .map(getEffectLabel)
          .join(', '),
        exclusions: Array.from(effect.exclusions ?? [])
          .map(getEffectLabel)
          .join(', ')
      })),

      hasEffects: effects.length > 0
    })
  }

  return context
}

export const prepareSettingsContext = async function (context, actor) {
  const actorSettings = actor.system.settings ?? {}
  context.settings = actorSettings

  return context
}

export const prepareLimitedContext = async function (context, actor) {
  const actorCoreData = actor.system.core ?? {}
  // Part-specific data
  context.enrichedNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actorCoreData.publicNotes ?? ''
  )
  context.enrichedAppearance = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actorCoreData.appearance ?? ''
  )
  context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actorCoreData.biography ?? ''
  )

  return context
}

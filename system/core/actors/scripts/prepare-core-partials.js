import { generateTrackers } from './generate-trackers.js'

export const prepareAttributesContext = async function (context, actor) {
  const attributeGroups = WOD6E.AttributeGroups.getList({})
  const attributes = WOD6E.Attributes.getList({})

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
          value: foundry.utils.getProperty(actor, attribute.path)
        }))
    }))

  return context
}

export const prepareResourcesContext = async function (context, actor) {
  const actorHealth = actor.system.health
  context.health = {
    // Other splats may call this "Health" in the future
    // So let's think smartly and just make this a variable
    // upfront instead of putting it on the sheet
    label: 'WOD6E.RESOURCES.Vitae',
    path: 'system.health.value',
    value: actorHealth.value,
    max: actorHealth.max,
    baneful: actorHealth.baneful,
    trackers: generateTrackers({
      name: game.i18n.localize('WOD6E.RESOURCES.Vitae'),
      damageName: game.i18n.localize('WOD6E.RESOURCES.Baneful'),
      value: actorHealth.value,
      max: actorHealth.max,
      disabled: actorHealth.disabled
    })
  }

  const actorWillpower = actor.system.willpower
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

  return context
}

export const prepareSettingsContext = async function (context, actor) {
  const actorSettings = actor.system.settings
  context.settings = actorSettings

  return context
}

export const prepareLimitedContext = async function (context, actor) {
  const actorCoreData = actor.system.core
  // Part-specific data
  context.enrichedNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actorCoreData.publicNotes
  )
  context.enrichedAppearance = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actorCoreData.appearance
  )
  context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actorCoreData.biography
  )

  return context
}

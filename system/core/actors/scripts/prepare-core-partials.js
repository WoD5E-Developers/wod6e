import { Attributes } from '../../config/attributes.js'
import { AttributeGroups } from '../../config/attributes-groups.js'

export const prepareAttributesContext = async function (context, actor) {
  const attributeGroups = AttributeGroups.getList({})
  const attributes = Attributes.getList({})

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
  const actorVitae = actor.system.vitae
  context.vitae = actorVitae

  const actorWillpower = actor.system.willpower
  context.willpower = actorWillpower

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

export const prepareAttributesContext = async function (context, actor) {
  const actorAttributes = actor.system.attributes
  context.attributes = actorAttributes

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

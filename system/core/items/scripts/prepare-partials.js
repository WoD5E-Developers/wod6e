export const prepareDescriptionContext = async function (context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.description

  // Part-specific data
  context.description = itemData?.description
  context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    itemData?.description
  )

  return context
}

export const prepareItemSettingsContext = async function (context) {
  // Tab data
  context.tab = context.tabs.settings

  return context
}

export const prepareBeastContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.beast

  const itemData = item.system

  context.beast = itemData?.beast || {}
  context.enrichedBeastDescription =
    await foundry.applications.ux.TextEditor.implementation.enrichHTML(itemData?.beast?.description)

  return context
}

export const prepareCurseContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.curse

  const itemData = item.system

  context.curse = itemData?.curse || {}
  context.enrichedCurseDescription =
    await foundry.applications.ux.TextEditor.implementation.enrichHTML(itemData?.curse?.description)

  return context
}

export const prepareFrenzyContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.frenzy

  const itemData = item.system

  context.frenzy = itemData?.frenzy || {}
  context.enrichedFrenzyDescription =
    await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      itemData?.frenzy?.description
    )

  return context
}

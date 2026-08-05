import { buildEnrichedField } from '../../../../../core/items/scripts/build-enriched-field.js'

export const prepareBeastContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.beast

  const itemData = item?.system

  // Part-specific data
  context.descriptionName = {
    path: 'system.beast.name',
    value: itemData?.beast?.name || ''
  }

  context.description = await buildEnrichedField({
    path: 'system.beast.description',
    value: itemData?.beast?.description
  })

  return context
}

export const prepareCurseContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.curse

  const itemData = item?.system

  // Part-specific data
  context.descriptionName = {
    path: 'system.curse.name',
    value: itemData?.curse?.name || ''
  }

  context.description = await buildEnrichedField({
    path: 'system.curse.description',
    value: itemData?.curse?.description
  })

  return context
}

export const prepareFrenzyContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.frenzy

  const itemData = item?.system

  // Part-specific data
  context.descriptionName = {
    path: 'system.frenzy.name',
    value: itemData?.frenzy?.name || ''
  }

  context.description = await buildEnrichedField({
    path: 'system.frenzy.description',
    value: itemData?.frenzy?.description
  })

  return context
}

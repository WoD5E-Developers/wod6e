import { buildEnrichedField } from './build-enriched-field.js'

export const prepareDescriptionContext = async function (context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.description

  // Part-specific data
  context.description = await buildEnrichedField({
    path: 'system.description',
    field: itemData?.description
  })

  return context
}

export const prepareItemSettingsContext = async function (context) {
  // Tab data
  context.tab = context.tabs.settings

  return context
}

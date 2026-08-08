import { buildEnrichedField } from '../../../../../core/items/scripts/build-enriched-field.js'

export const prepareIndulgingContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.indulging

  const itemData = item?.system

  // Part-specific data
  context.description = await buildEnrichedField({
    path: 'system.indulging',
    value: itemData?.indulging
  })

  return context
}

export const prepareOutburstContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.outburst

  const itemData = item?.system

  // Part-specific data
  context.descriptionName = {
    path: 'system.outburst.name',
    value: itemData?.outburst?.name || ''
  }

  context.description = await buildEnrichedField({
    path: 'system.outburst.description',
    value: itemData?.outburst?.description
  })

  return context
}

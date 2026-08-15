import { buildEnrichedField } from '../../../../../core/items/scripts/build-enriched-field.js'

export const prepareMaturingContext = async function (context, item) {
  // Tab data
  context.tab = context.tabs.maturing

  const itemData = item?.system
  const maturing = itemData?.maturing ?? []

  // Part-specific data
  context.maturing = await Promise.all(
    maturing.map(async (entry, index) => ({
      index,
      level: {
        path: `system.maturing.${index}.level`,
        value: entry?.level ?? 1
      },
      description: await buildEnrichedField({
        path: `system.maturing.${index}.description`,
        value: entry?.description ?? ''
      })
    }))
  )

  return context
}

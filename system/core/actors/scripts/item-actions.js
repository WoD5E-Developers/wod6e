import { CompendiumBrowserApplication } from '../../applications/compendium-browser/compendium-bowser.js'
import { formatDataItemId } from '../../items/scripts/on-format-data-id.js'

export const _onCreateItem = async function (event, target) {
  event.preventDefault()

  const actor = this.actor
  const type = target.dataset.type

  if (!type) return

  const name = game.i18n.format('NewString', {
    string: game.i18n.localize(`TYPES.Item.${type}`)
  })

  await Item.create(
    {
      name,
      type,
      flags: {
        wod5e: {
          dataItemId: `${type}-${formatDataItemId(name)}`
        }
      }
    },
    {
      parent: actor
    }
  )
}

// Open up the compendium browser with the specified item type filtered down to
export const _onSearchItem = async function (event, target) {
  event.preventDefault()

  // Top-level variables
  const type = target.getAttribute('data-type')
  const subtype = target.getAttribute('data-subtype')

  new CompendiumBrowserApplication({
    type,
    subtype
  }).render(true)
}

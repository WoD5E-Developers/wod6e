import { ItemTypes } from '../../config/item-types.js'
import { _onSortItem } from './on-sort-item.js'

export class ActorUX {
  // A list of targets to restore the scroll positions of and their keys
  static scrollTargets = [
    {
      selector: 'section.tab.active',
      key: () => 'active-tab'
    },
    {
      selector: '.multi-select-dropdown',
      key: (element, index) =>
        element.closest('[data-multi-select]')?.dataset.fieldPath ?? `multi-select-${index}`
    }
  ]

  // Save the current scroll position
  static _saveScrollPositions(sheet) {
    sheet._scrollPositions ??= new Map()
    sheet._scrollPositions.clear()

    for (const target of this.scrollTargets) {
      $(sheet.element)
        .find(target.selector)
        .each((index, element) => {
          const key = target.key(element, index)
          const scrollTop = element.scrollTop
          const scrollLeft = element.scrollLeft

          sheet._scrollPositions.set(key, {
            scrollTop,
            scrollLeft
          })
        })
    }
  }

  // Restore the saved scroll position
  static _restoreScrollPositions(sheet) {
    if (!sheet._scrollPositions) return

    for (const target of this.scrollTargets) {
      $(sheet.element)
        .find(target.selector)
        .each((index, element) => {
          const key = target.key(element, index)
          const savedPosition = sheet._scrollPositions.get(key)

          if (!savedPosition) return

          element.scrollTop = savedPosition.scrollTop
          element.scrollLeft = savedPosition.scrollLeft
        })
    }
  }

  // Save the maxHeight of all collapsible-content elements if it's greater than 0
  static async _saveCollapsibleStates(actor) {
    // Clear out the old states
    actor._collapsibleStates.clear()

    // Iterate through each collapsible element in the page
    $(actor.element)
      .find('.collapsible-content')
      .each((index, content) => {
        const contentElement = $(content)
        const maxHeight = parseFloat(contentElement.css('maxHeight'))

        // Check if max height is greater than 0, and if it is, we save its maxHeight state
        if (maxHeight > 0) {
          actor._collapsibleStates.set(contentElement.attr('data-id') || index, maxHeight)
        }
      })
  }

  // Restore the maxHeight of previously expanded collapsible-content elements
  static async _restoreCollapsibleStates(actor) {
    $(actor.element)
      .find('.collapsible-content')
      .each((index, content) => {
        const contentElement = $(content)
        const key = contentElement.attr('data-id') || index // Match with saved state

        if (actor._collapsibleStates.has(key)) {
          // Disable the transition property before re-setting the max height
          // This makes it so that on re-render, the user doesn't watch the
          // collapse animation again
          contentElement.css('transition', 'none')
          $(content).css('maxHeight', `${actor._collapsibleStates.get(key)}px`)

          // Force a reflow and then re-enable the transition property
          // We have to tell eslint to ignore the no-void rule because it's genuinely useful here

          void contentElement[0].offsetHeight
          contentElement.css('transition', '')
        }
      })
  }

  static async _onDropItem(event, actor, data) {
    if (!actor.isOwner) return false
    const actorType = actor.type
    const item = await Item.implementation.fromDropData(data)
    const itemData = item.toObject()
    const itemType = itemData.type
    const itemsList = ItemTypes.getList({})

    // Check whether we should allow this item type to be placed on this actor type
    if (itemsList[itemType]) {
      const whitelist = itemsList[itemType].restrictedActorTypes
      const blacklist = itemsList[itemType].excludedActorTypes

      // If the whitelist contains any entries, we can check to make sure this actor type is allowed for the item
      // We go through the base actor type, then subtypes - if we match to any of them, we allow the item to be
      // added to the actor.
      // We don't need to add this logic to the blacklist because the blacklist only needs to check against the base types.
      if (
        !foundry.utils.isEmpty(whitelist) &&
        // This is just a general check against the base actorType
        !whitelist.includes(actorType) &&
        // If the actor is an NPC, check against the subtype
        !(actorType === 'npc' && whitelist.includes(actor.system.subtype)) &&
        // If the actor is a Group sheet, check against the subtype
        !(actorType === 'group' && whitelist.includes(actor.system.subtype))
      ) {
        ui.notifications.warn(
          game.i18n.format('WOD6E.ITEMS.ItemCannotBeDroppedOnActor', {
            string1: itemType,
            string2: actorType
          })
        )

        return false
      }

      // If the blacklist contains any entries, we can check to make sure this actor type isn't disallowed for the item
      if (!foundry.utils.isEmpty(blacklist) && blacklist.indexOf(actorType) > -1) {
        ui.notifications.warn(
          game.i18n.format('WOD6E.ITEMS.ItemCannotBeDroppedOnActor', {
            string1: itemType,
            string2: actorType
          })
        )

        return false
      }

      // Handle limiting only a single type of an item to an actor
      if (itemsList[itemType].limitOnePerActor) {
        // Delete all other types of this item on the actor
        const duplicateItemTypeInstances = actor.items
          .filter((item) => item.type === itemType)
          .map((item) => item.id)

        actor.deleteEmbeddedDocuments('Item', duplicateItemTypeInstances)
      }
    }

    // Handle item sorting within the same Actor
    if (actor.uuid === item.parent?.uuid) return _onSortItem(event, actor, itemData)

    // Conditions whose effects read a trait from their source actor need that
    // source to be chosen when a GM assigns the condition.
    if (
      game.user.isGM &&
      itemData.type === 'condition' &&
      itemData.system?.effects?.some((effect) => effect.valueSource === 'sourceTrait')
    ) {
      const sourceUuid = await this._promptForConditionSource(itemData)
      if (!sourceUuid) return false

      foundry.utils.setProperty(itemData, 'system.condition.sourceUuid', sourceUuid)
    }

    // Create the owned item
    return this._onDropItemCreate(actor, itemData)
  }

  static async _onDropCanvasItem(canvas, data) {
    if (data.type !== 'Item' || !data.uuid) return

    // Tokens later in the placeables array are rendered above earlier tokens,
    // so prefer the topmost token when tokens overlap
    const token = canvas.tokens?.placeables?.findLast((token) =>
      token.bounds.contains(data.x, data.y)
    )
    if (!token?.actor) return

    await this._onDropItem(null, token.actor, data)

    // The item drop was handled (or deliberately rejected) by the actor logic
    return false
  }

  static async _promptForConditionSource(itemData) {
    const actors = game.actors.contents.toSorted((a, b) => a.name.localeCompare(b.name))
    const selectedUuid = itemData.system?.condition?.sourceUuid
    const options = actors
      .map((actor) => {
        const uuid = Handlebars.escapeExpression(actor.uuid)
        const name = Handlebars.escapeExpression(actor.name)
        const selected = actor.uuid === selectedUuid ? ' selected' : ''

        return `<option value="${uuid}"${selected}>${name}</option>`
      })
      .join('')

    const result = await foundry.applications.api.DialogV2.input({
      window: {
        title: game.i18n.localize('WOD6E.CONDITIONS.SelectSourceActor')
      },
      content: `
        <div class="form-group">
          <label for="condition-source-actor">
            ${game.i18n.localize('WOD6E.CONDITIONS.SourceActor')}
          </label>
          <select id="condition-source-actor" name="sourceUuid" required>
            ${options}
          </select>
        </div>
      `,
      ok: {
        icon: 'fas fa-check',
        label: game.i18n.localize('WOD6E.Confirm')
      },
      buttons: [
        {
          action: 'cancel',
          icon: 'fas fa-times',
          label: game.i18n.localize('WOD6E.Cancel'),
          type: 'button'
        }
      ],
      modal: true
    })

    if (!result || result === 'cancel') return null
    return result.sourceUuid
  }

  static async _onDropItemCreate(actor, itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData]
    return actor.createEmbeddedDocuments('Item', itemData)
  }
}

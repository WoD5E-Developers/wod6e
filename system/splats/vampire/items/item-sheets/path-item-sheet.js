import { WoDItemBase } from '../../../../core/items/item-sheets/wod-item-base.js'
import {
  prepareDescriptionContext,
  prepareItemSettingsContext
} from '../../../../core/items/scripts/prepare-partials.js'

function canReadPath(item) {
  if (item?.type !== 'path' || item.parent) return false
  if (item.pack) return Boolean(game.packs.get(item.pack)?.visible)
  return item.visible
}

export class PathItemSheet extends WoDItemBase {
  static DEFAULT_OPTIONS = {
    form: { handler: PathItemSheet.submitPathForm },
    position: { width: 650, height: 650 },
    actions: {
      replacePath: async function (_event, target) {
        if (!this.isEditable || target.disabled) return
        const select = target.closest('.path-replacement').querySelector('[data-path-source]')
        const uuid = select.value
        if (!uuid || uuid === select.dataset.currentPath || uuid === this.item.uuid) return

        target.disabled = true
        select.disabled = true
        try {
          const source = await globalThis.fromUuid(uuid)
          if (!canReadPath(source)) {
            ui.notifications.warn(game.i18n.localize('WOD6E.VAMPIRE.PathUnavailable'))
            return
          }
          const updated = await this.item.update({
            name: source.name,
            img: source.img,
            system: source.toObject().system,
            'flags.wod6e.pathSourceUuid': uuid,
            'flags.wod6e.dataItemId': source.getFlag('wod6e', 'dataItemId') ?? ''
          })
          if (updated) select.dataset.currentPath = uuid
        } finally {
          select.disabled = !this.isEditable
          this._updateReplaceButton(select)
        }
      },
      addPathPrecept: async function () {
        if (!this.item.isOwner) return
        await this.item.update({
          'system.precepts': [...this.item.system.precepts, { precept: '', violation: '' }]
        })
      },
      removePathPrecept: async function (_event, target) {
        if (!this.item.isOwner) return
        await this.item.update({
          'system.precepts': this.item.system.precepts.filter(
            (_row, index) => index !== Number(target.dataset.index)
          )
        })
      }
    }
  }

  static async submitPathForm(_event, _form, formData) {
    const update = foundry.utils.expandObject(formData.object)
    if (update.system?.precepts) {
      update.system.precepts = this.item.system.precepts.map((row, index) => ({
        ...row,
        ...update.system.precepts[index]
      }))
    }
    await this.item.update(update)
  }

  static PARTS = {
    header: { template: 'systems/wod6e/templates/core/items/path-item-sheet.hbs' },
    tabs: { template: 'templates/generic/tab-navigation.hbs' },
    description: { template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs' },
    path: { template: 'systems/wod6e/templates/splats/vampire/items/path-details.hbs' },
    teachings: { template: 'systems/wod6e/templates/splats/vampire/items/path-teachings.hbs' },
    settings: { template: 'systems/wod6e/templates/core/items/parts/item-settings.hbs' }
  }

  tabs = {
    description: { id: 'description', group: 'primary', label: 'WOD6E.TABS.Description' },
    path: { id: 'path', group: 'primary', label: 'WOD6E.VAMPIRE.Path' },
    teachings: { id: 'teachings', group: 'primary', label: 'WOD6E.VAMPIRE.Teachings' },
    settings: { id: 'settings', group: 'primary', label: 'WOD6E.TABS.Settings' }
  }

  async _preparePartContext(partId, context, options) {
    context = { ...(await super._preparePartContext(partId, context, options)) }
    if (partId === 'description') return prepareDescriptionContext(context, this.item)
    if (partId === 'settings') return prepareItemSettingsContext(context, this.item)
    if (partId === 'header') Object.assign(context, await this._preparePathOptions())
    if (partId === 'path' || partId === 'teachings') {
      context.tab = context.tabs[partId]
      context.path = this.item.system
    }
    return context
  }

  _attachPartListeners(partId, element, options) {
    super._attachPartListeners(partId, element, options)
    if (partId !== 'header') return
    const select = element.querySelector('[data-path-source]')
    select.addEventListener('change', (event) => {
      event.stopPropagation()
      this._updateReplaceButton(select)
    })
  }

  _updateReplaceButton(select) {
    select.closest('.path-replacement').querySelector('[data-action="replacePath"]').disabled =
      !this.isEditable ||
      !select.value ||
      select.value === select.dataset.currentPath ||
      select.value === this.item.uuid
  }

  async _preparePathOptions() {
    const entries = game.items.filter(canReadPath).map((item) => [item.uuid, item.name])
    const packs = game.packs.filter((pack) => pack.documentName === 'Item' && pack.visible)
    let builtInSource
    const packedEntries = await Promise.all(
      packs.map(async (pack) => {
        const builtIn = pack.collection === 'wod6e.paths'
        const index = await pack.getIndex({ fields: builtIn ? ['system.pathType'] : [] })
        return index
          .filter((item) => item.type === 'path')
          .map((item) => {
            const uuid = pack.getUuid(item._id)
            if (builtIn && item.system?.pathType === this.item.system.pathType) builtInSource = uuid
            return [uuid, `${item.name} (${pack.title})`]
          })
      })
    )
    const pathOptions = Object.fromEntries(
      [...entries, ...packedEntries.flat()].sort(([, a], [, b]) => a.localeCompare(b))
    )
    const sourceUuid = this.item.getFlag('wod6e', 'pathSourceUuid')
    const currentUuid =
      sourceUuid ??
      (this.item.isEmbedded
        ? (this.item._stats?.compendiumSource ?? builtInSource)
        : this.item.uuid)
    const currentPath = Object.hasOwn(pathOptions, currentUuid) ? currentUuid : ''
    return {
      currentPath: currentPath ?? '',
      pathOptions: currentPath ? pathOptions : { '': this.item.name, ...pathOptions }
    }
  }
}

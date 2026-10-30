import { addGroupMember, removeGroupMember } from '../actors/scripts/group-members.js'
import { prepareGroupDirectory } from './scripts/prepare-group-directory.js'

const actorPartial = 'templates/sidebar/partials/document-partial.hbs'

export class WoDActorDirectory extends foundry.applications.sidebar.tabs.ActorDirectory {
  static DEFAULT_OPTIONS = {
    actions: {
      toggleGroup: WoDActorDirectory.toggleGroup
    },
    renderUpdateKeys: [
      'system.members',
      'system.subtype',
      'system.settings.limited.members',
      'type'
    ]
  }

  static PARTS = {
    ...super.PARTS,
    directory: {
      ...super.PARTS.directory,
      template: 'systems/wod6e/templates/core/ui/actor-directory.hbs',
      templates: [actorPartial]
    }
  }

  static _entryPartial = 'systems/wod6e/templates/core/ui/actor-directory-entry.hbs'

  get expandedGroups() {
    const state = game.settings.get('wod6e', 'groupDirectoryExpanded')
    return new Set(state[`${game.world.id}:${game.user.id}`] ?? [])
  }

  async _saveExpandedGroups(expanded) {
    const state = game.settings.get('wod6e', 'groupDirectoryExpanded')
    return game.settings.set('wod6e', 'groupDirectoryExpanded', {
      ...state,
      [`${game.world.id}:${game.user.id}`]: [...expanded]
    })
  }

  async _prepareDirectoryContext(context, options) {
    await super._prepareDirectoryContext(context, options)
    Object.assign(
      context,
      prepareGroupDirectory(context.tree, this.collection.contents, game.user, this.expandedGroups)
    )
  }

  static async toggleGroup(event, target) {
    event.preventDefault()
    const entry = target.closest('[data-group-id]')
    if (!entry) return

    const expanded = this.expandedGroups
    const isExpanded = !entry.classList.contains('expanded')
    if (isExpanded) expanded.add(entry.dataset.groupId)
    else expanded.delete(entry.dataset.groupId)
    this._setGroupExpanded(entry, isExpanded)
    await this._saveExpandedGroups(expanded)
  }

  _setGroupExpanded(entry, expanded) {
    entry.classList.toggle('expanded', expanded)
  }

  async collapseAll() {
    super.collapseAll()
    for (const entry of this.element.querySelectorAll('[data-group-id]')) {
      this._setGroupExpanded(entry, false)
    }
    await this._saveExpandedGroups(new Set())
  }

  _onSearchFilter(event, query, rgx, html) {
    super._onSearchFilter(event, query, rgx, html)
    const expanded = this.expandedGroups

    for (const entry of html.querySelectorAll('[data-group-id]')) {
      const members = Array.from(entry.querySelectorAll('.subdirectory > [data-entry-id]'))
      const groupMatches = entry.style.display !== 'none'
      const memberMatches = members.some((member) => member.style.display !== 'none')
      const matches = groupMatches || memberMatches

      entry.style.display = !query || matches ? 'flex' : 'none'
      if (query && groupMatches) {
        for (const member of members) member.style.display = 'flex'
      }
      this._setGroupExpanded(entry, query ? matches : expanded.has(entry.dataset.groupId))

      // Members may live in a real folder
      if (query && matches) {
        let folder = entry.parentElement.closest('.directory-item.folder')
        while (folder) {
          folder.style.display = 'flex'
          folder.classList.add('expanded')
          folder = folder.parentElement.closest('.directory-item.folder')
        }
      }
    }
  }

  async _onRender(context, options) {
    await super._onRender(context, options)
    if (!options.parts.includes('directory')) return

    for (const entry of this.element.querySelectorAll('[data-group-id]')) {
      entry.addEventListener('dragenter', (event) => {
        event.stopPropagation()
        if (!this.collection.get(entry.dataset.groupId)?.isOwner) return
        for (const target of this.element.querySelectorAll('.droptarget')) {
          target.classList.remove('droptarget')
        }
        entry.classList.add('droptarget')
      })
      entry.addEventListener('dragleave', (event) => {
        event.stopPropagation()
        if (!entry.contains(event.relatedTarget)) entry.classList.remove('droptarget')
      })
    }
  }

  _canDragDrop(selector) {
    return (
      super._canDragDrop(selector) ||
      this.collection.some((actor) => actor.type === 'group' && actor.visible && actor.isOwner)
    )
  }

  _onDrop(event) {
    const groupEntry = event.target.closest('[data-group-id]')
    if (groupEntry) {
      groupEntry.classList.remove('droptarget')
      const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)
      if (data.type !== 'Actor') return false
      return this._handleDroppedEntry(groupEntry, data)
    }

    if (!super._canDragDrop()) return false
    return super._onDrop(event)
  }

  async _handleDroppedEntry(target, data) {
    const groupId = target?.closest('[data-group-id]')?.dataset.groupId
    if (!groupId) return super._handleDroppedEntry(target, data)

    const group = this.collection.get(groupId)
    if (group?.type !== 'group' || !group.visible || !group.isOwner) return false

    let actor = await this._getDroppedEntryFromData(data)
    if (!actor || actor.type === 'group' || actor.isToken || !actor.visible) return false

    if (!this._entryAlreadyExists(actor)) {
      if (!actor.pack || !this.documentClass.canUserCreate(game.user)) return false
      actor = await this._createDroppedEntry(actor, { folder: null })
      if (!actor) return false
    }

    return addGroupMember(group, actor.uuid)
  }

  _getEntryContextOptions() {
    const options = super._getEntryContextOptions()
    options.push({
      label: 'WOD6E.GROUPS.RemoveFromGroup',
      icon: 'fa-solid fa-user-minus',
      visible: (entry) => {
        const groupEntry = entry.closest('[data-group-id]')
        return Boolean(
          groupEntry &&
          groupEntry !== entry &&
          this.collection.get(groupEntry.dataset.groupId)?.isOwner
        )
      },
      onClick: (event, entry) => {
        const group = this.collection.get(entry.closest('[data-group-id]')?.dataset.groupId)
        const actor = this.collection.get(entry.dataset.entryId)
        if (group && actor) return removeGroupMember(group, actor.uuid)
      }
    })
    return options
  }
}

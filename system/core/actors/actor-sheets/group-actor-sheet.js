import { WoDActorBase } from './wod-actor-base.js'
import { _onOpenItem } from '../../applications/compendium-browser/scripts/on-open-item.js'
import { _onCreateItem, _onSearchItem } from '../scripts/item-actions.js'
import { _onSendItemToChat } from '../../scripts/on-send-item-to-chat.js'
import { _onSetTrackerValue } from '../scripts/on-set-tracker-value.js'
import {
  addGroupMember,
  openGroupMember,
  removeGroupMember,
  rerenderGroupsForUser
} from '../scripts/group-members.js'
import {
  createRelationship,
  deleteRelationship,
  editRelationship
} from '../scripts/group-relationships.js'
import {
  deletePooledResource,
  dropPooledResource,
  updateResourceContributor
} from '../scripts/group-resources.js'
import {
  prepareGroupLimitedContext,
  prepareGroupMembersContext,
  prepareGroupOverviewContext,
  prepareGroupRelationshipsContext,
  prepareGroupResourcesContext,
  prepareGroupSettingsContext
} from '../scripts/prepare-group-partials.js'

const { HandlebarsApplicationMixin } = foundry.applications.api

export class GroupActorSheet extends HandlebarsApplicationMixin(WoDActorBase) {
  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true,
      handler: GroupActorSheet.onSubmitActorForm
    },
    classes: ['wod6e', 'actor', 'sheet', 'group'],
    position: {
      width: 850,
      height: 800
    },
    actions: {
      // Item actions
      createItem: _onCreateItem,
      searchItem: _onSearchItem,
      openItem: _onOpenItem,
      sendItemToChat: _onSendItemToChat,

      // Open/remove members
      openMember: openGroupMember,
      removeMember: removeGroupMember,

      // Relationships
      createRelationship,
      editRelationship,
      deleteRelationship,

      // Fields
      deletePooledResource,
      setTrackerValue: _onSetTrackerValue
    }
  }

  static PARTS = {
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    main: {
      template: 'systems/wod6e/templates/core/actors/group/group-overview.hbs'
    },
    members: {
      template: 'systems/wod6e/templates/core/actors/group/group-members.hbs'
    },
    resources: {
      template: 'systems/wod6e/templates/core/actors/group/group-resources.hbs'
    },
    settings: {
      template: 'systems/wod6e/templates/core/actors/group/group-settings.hbs'
    },
    limited: {
      template: 'systems/wod6e/templates/core/actors/group/group-limited-sheet.hbs'
    }
  }

  static TABS = {
    primary: {
      tabs: [
        {
          id: 'main',
          icon: 'fa-solid fa-users',
          label: 'WOD6E.TABS.Overview'
        },
        {
          id: 'members',
          icon: 'fa-solid fa-people-group',
          label: 'WOD6E.GROUPS.Members'
        },
        {
          id: 'resources',
          icon: 'fa-solid fa-coins',
          label: 'WOD6E.GROUPS.PooledResources'
        },
        {
          id: 'settings',
          icon: 'fa-solid fa-gear',
          label: 'WOD6E.TABS.Settings'
        }
      ],
      initial: 'main'
    }
  }

  async _prepareContext() {
    const context = await super._prepareContext()

    context.tabs = this._prepareTabs('primary')

    return context
  }

  async _preparePartContext(partId, context, options) {
    context = { ...(await super._preparePartContext(partId, context, options)) }
    const actor = this.actor

    switch (partId) {
      case 'main':
        return prepareGroupOverviewContext(context, actor)

      case 'members':
        context = await prepareGroupMembersContext(context, actor)
        return prepareGroupRelationshipsContext(context, actor)

      case 'resources':
        return prepareGroupResourcesContext(context, actor)

      case 'settings':
        return prepareGroupSettingsContext(context, actor)

      case 'limited':
        return prepareGroupLimitedContext(context, actor)
    }

    return context
  }

  static async onSubmitActorForm(event, form, formData) {
    const fieldPath = event.target.name

    if (['system.subtype', 'system.coterieType'].includes(fieldPath)) {
      return this.actor.update({ [fieldPath]: event.target.value })
    }

    return WoDActorBase.onSubmitActorForm.call(this, event, form, formData)
  }

  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)

    if (data.type === 'Actor') return addGroupMember(this.actor, data.uuid)
    if (data.type === 'Item') return dropPooledResource(event, this.actor, data)
  }

  async _onRender(options) {
    await super._onRender(options)

    this.element.querySelectorAll('[data-resource-contributor]').forEach((select) => {
      select.addEventListener('change', (event) => {
        updateResourceContributor(
          this.actor,
          event.currentTarget.dataset.itemId,
          event.currentTarget.value
        )
      })
    })
  }
}

Hooks.on('updateUser', (user, changes) => {
  const changedPaths = foundry.utils.flattenObject(changes)

  // Rerender groups if a user updates their quickening or if their player character updates
  if (
    Object.hasOwn(changedPaths, 'flags.wod6e.quickening') ||
    Object.hasOwn(changedPaths, 'character')
  ) {
    rerenderGroupsForUser(user)
  }
})

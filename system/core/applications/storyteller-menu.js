/* Definitions */
import { Attributes } from '../config/attributes.js'
import { Skills } from '../config/skills.js'
import { Disciplines } from '../../splats/vampire/config/disciplines.js'

export class StorytellerMenu extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('WOD6E.Settings.StorytellerMenu'),
      id: 'wod6e-storyteller',
      classes: ['wod6e'],
      template: 'systems/wod6e/display/ui/storyteller-menu.hbs',
      width: 500,
      height: 450,
      resizable: true,
      closeOnSubmit: true,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: 'section',
          initial: 'modifications'
        }
      ]
    })
  }

  constructor(application, options) {
    super(application, options)

    this.listKeys = {
      attribute: {
        newModTitle: game.i18n.format('WOD6E.Settings.NewStringModification', {
          string: game.i18n.localize('WOD6E.AttributesList.Label')
        }),
        defCategory: 'Attributes',
        labelCategory: 'AttributesList',
        defClass: Attributes
      },
      skill: {
        newModTitle: game.i18n.format('WOD6E.Settings.NewStringModification', {
          string: game.i18n.localize('WOD6E.SkillsList.Label')
        }),
        defCategory: 'Skills',
        labelCategory: 'SkillsList',
        defClass: Skills
      },
      discipline: {
        newModTitle: game.i18n.format('WOD6E.Settings.NewStringModification', {
          string: game.i18n.localize('WOD6E.VTM.Discipline')
        }),
        defCategory: 'Disciplines',
        labelCategory: 'DisciplinesList',
        defClass: Disciplines
      }
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = await super.getData()

    data.attributeTypes = {
      physical: 'WOD6E.SPC.Physical',
      social: 'WOD6E.SPC.Social',
      mental: 'WOD6E.SPC.Mental'
    }

    // Grab the modifications from the game settings and add them to the application data
    data.attributeModifications = game.settings.get('wod6e', 'modifiedAttributes')
    data.skillModifications = game.settings.get('wod6e', 'modifiedSkills')
    data.disciplineModifications = game.settings.get('wod6e', 'modifiedDisciplines')

    // Grab the custom features from the game settings and add them to the application data
    data.customAttributes = game.settings.get('wod6e', 'customAttributes')
    data.customSkills = game.settings.get('wod6e', 'customSkills')
    data.customDisciplines = game.settings.get('wod6e', 'customDisciplines')

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    const handleClick = (selector, handler) => {
      html[0].querySelectorAll(selector).forEach((element) => {
        element.addEventListener('click', function (event) {
          event.preventDefault()
          const data = event.target.dataset
          handler(data)
        })
      })
    }

    const addCustomItem = async (listKey, label) => {
      const list = await game.settings.get('wod6e', listKey)
      const newItem = {
        id: foundry.utils.randomID(8),
        label
      }

      // Fill in extra default data for custom attributes/skills
      if (listKey === 'customAttributes' || listKey === 'customSkills') {
        newItem.type = 'physical'
      }

      // Push the default item into the main list and save the new setting
      list.push(newItem)
      await game.settings.set('wod6e', listKey, list)
    }

    handleClick('.add-mod-button', ({ type }) => this._onGenerateModPrompt(type))
    handleClick('.remove-mod-button', ({ type, id }) => this._onRemoveChange(type, id))

    handleClick('.add-custom-button', async ({ type }) => {
      if (type === 'attribute') {
        await addCustomItem('customAttributes', 'New Attribute')
      } else if (type === 'skill') {
        await addCustomItem('customSkills', 'New Skill')
      } else if (type === 'discipline') {
        await addCustomItem('customDisciplines', 'New Discipline')
      }
    })

    handleClick('.remove-custom-button', ({ type, id }) => this._onRemoveCustom(type, id))

    handleClick('.save-modifications', () => {
      const modifications = {
        attribute: [],
        skill: [],
        discipline: []
      }
      const custom = {
        attribute: [],
        skill: [],
        discipline: []
      }

      const handleFeature = (feature, list) => {
        const { id, type, label } = feature.dataset
        const rename = $(feature).find('.mod-rename')[0].value
        const hidden = $(feature).find('.mod-hidden')[0].checked
        list[type].push({ id, rename, label, hidden })
      }

      const handleCustomFeature = (feature, customList) => {
        const { id, type } = feature.dataset
        const label = $(feature).find('.label')[0].value
        const attrType = $(feature).find('.attr-type')[0]?.value || ''
        const newItem = { id, label }
        if (type === 'attribute' || type === 'skill') newItem.type = attrType
        customList[type].push(newItem)
      }

      html[0].querySelectorAll('.modification-row').forEach(function (row) {
        handleFeature(row, modifications)
      })

      html[0].querySelectorAll('.customization-row').forEach(function (row) {
        handleCustomFeature(row, custom)
      })

      // Attributes
      game.settings.set('wod6e', 'modifiedAttributes', modifications.attribute)
      game.settings.set('wod6e', 'customAttributes', custom.attribute)
      // Skills
      game.settings.set('wod6e', 'modifiedSkills', modifications.skill)
      game.settings.set('wod6e', 'customSkills', custom.skill)
      // Disciplines
      game.settings.set('wod6e', 'modifiedDisciplines', modifications.discipline)
      game.settings.set('wod6e', 'customDisciplines', custom.discipline)
    })
  }

  // Function for getting the information necessary for the selection dialog
  async _onGenerateModPrompt(type) {
    const list = await WOD6E[this.listKeys[type].defCategory].getList({})
    this._onRenderPromptDialog(type, list, this.listKeys[type].newModTitle)
  }

  // Function for rendering the dialog for adding a new modification
  async _onRenderPromptDialog(type, list, title) {
    const modifiedKey = `modified${this.listKeys[type].defCategory}`
    const modifiedList = await game.settings.get('wod6e', modifiedKey)

    const effectiveList = Object.fromEntries(
      Object.entries(list).filter((item) => !modifiedList.some((mod) => mod.id === item[0]))
    )

    const template = 'systems/wod6e/display/ui/select-dialog.hbs'
    const content = await foundry.applications.handlebars.renderTemplate(template, {
      options: effectiveList
    })

    const result = await foundry.applications.api.DialogV2.input({
      window: { title },
      content,
      ok: {
        icon: 'fas fa-check',
        label: game.i18n.localize('WOD6E.Add')
      },
      buttons: [
        {
          action: 'cancel',
          icon: 'fas fa-times',
          label: game.i18n.localize('WOD6E.Cancel'),
          type: 'button'
        }
      ]
    })

    if (result !== 'cancel') {
      const id = result.optionSelect
      const label = list[id]?.label || id
      modifiedList.push({ id, label, rename: '', hidden: false })
      await game.settings.set('wod6e', modifiedKey, modifiedList)
    }
  }

  // Function for removing a change
  async _onRemoveChange(type, id) {
    const modifiedKey = `modified${this.listKeys[type].defCategory}`
    let modifiedList = await game.settings.get('wod6e', modifiedKey)
    modifiedList = modifiedList.filter((item) => item.id !== id)
    await game.settings.set('wod6e', modifiedKey, modifiedList)
  }

  // Function for removing a custom feature
  async _onRemoveCustom(type, id) {
    const customKey = `custom${this.listKeys[type].defCategory}`
    delete this.listKeys[type].defClass[id]
    let customList = await game.settings.get('wod6e', customKey)
    customList = customList.filter((item) => item.id !== id)
    await game.settings.set('wod6e', customKey, customList)
  }
}

import {
  _onDocumentPointerDown,
  _onToggleMultiSelect,
  _onToggleMultiSelectOption
} from '../fields/multiselect.js'
import { ItemUX } from '../items/scripts/item-ux.js'
import { _calculateDicePool } from './scripts/calculate-dice-pool.js'
import { _getTestText } from './scripts/get-test-text.js'

const { DialogV2 } = foundry.applications.api
const { renderTemplate } = foundry.applications.handlebars

export class RollDialog {
  static TEMPLATE = 'systems/wod6e/templates/core/dialogs/roll-dialog.hbs'

  static async open({ actor, item = null, test = {} } = {}) {
    if (!actor) {
      console.error('Roll Dialog requires an actor.')
    }

    const data = this._prepareInitialData({ actor, item, test })
    const context = this._prepareContext({ actor, item, data })
    const rendered = await renderTemplate(this.TEMPLATE, context)

    const content = document.createElement('div')
    content.innerHTML = rendered

    return DialogV2.wait({
      window: {
        title: item?.name ?? game.i18n.localize('WOD6E.ROLL.Roll')
      },
      classes: ['wod6e', 'roll-dialog'],
      position: {
        width: 500
      },
      content,
      actions: {
        toggleMultiSelect: _onToggleMultiSelect,
        toggleMultiSelectOption: _onToggleMultiSelectOption
      },
      buttons: [
        {
          action: 'cancel',
          icon: 'fa-solid fa-xmark',
          label: game.i18n.localize('WOD6E.Cancel')
        },
        {
          action: 'roll',
          icon: 'fa-solid fa-dice-d10',
          label: game.i18n.localize('WOD6E.ROLL.Roll'),
          default: true,

          callback: async (_event, button) => {
            const data = this._getDataFromForm(button.form)
            const rollContext = this._prepareContext({ actor, data }).test

            const flavor = rollContext.testText
            const roll = new Roll(`${rollContext.dicePool}d10cs>=6`)

            await roll.evaluate()
            await roll.toMessage({
              speaker: ChatMessage.getSpeaker({ actor }),
              flavor
            })

            return roll
          }
        }
      ],

      rejectClose: false,

      render: (_event, dialog) => {
        this._activateListeners(dialog, {
          actor,
          item
        })

        // Multiselect dropdown listeners and things
        this._boundMultiSelectOutsideClick ??= _onDocumentPointerDown.bind(this)
        document.addEventListener('pointerdown', this._boundMultiSelectOutsideClick)
        ItemUX._restoreDropdownStates(this)
      }
    })
  }

  static _prepareInitialData({ item, test }) {
    // Determine whether we've been given an item or a non-item test
    const testData = item ? item?.system?.test : test

    const selectedTraits = {
      attributes: testData?.attributes || [],
      skills: testData?.skills || [],
      disciplines: testData?.disciplines || []
    }

    return selectedTraits
  }

  static _prepareContext({ actor, item, data }) {
    const attributeOptions = this._prepareOptions({
      definitions: WOD6E.configs.Attributes.getList({}),
      selected: data?.attributes || []
    })

    const skillOptions = this._prepareOptions({
      definitions: WOD6E.configs.Skills.getList({}),
      selected: data?.skills || []
    })

    const disciplineOptions = this._prepareOptions({
      definitions: WOD6E.configs.Disciplines.getList({}),
      selected: data?.disciplines || []
    })

    const selectedAttributesText = this._getSelectedText(attributeOptions)
    const selectedSkillsText = this._getSelectedText(skillOptions)
    const selectedDisciplinesText = this._getSelectedText(disciplineOptions)

    const testText = _getTestText({
      attributeOptions,
      skillOptions,
      disciplineOptions
    })

    const dicePool = _calculateDicePool(actor, data)
    const dicePoolText = game.i18n.format('WOD6E.ROLL.RollingString', {
      string: `${dicePool}d10`
    })

    return {
      actor,
      item,

      test: {
        attributeOptions,
        skillOptions,
        disciplineOptions,

        selectedAttributesText,
        selectedSkillsText,
        selectedDisciplinesText,

        testText,
        dicePool,
        dicePoolText
      }
    }
  }

  static _prepareOptions({ definitions, selected = [] }) {
    const selectedKeys = new Set(selected)

    return Object.entries(definitions)
      .filter(([, def]) => !def.hidden)
      .map(([key, def]) => ({
        key,
        label: def.displayName,
        selected: selectedKeys.has(key)
      }))
  }

  static _getSelectedText(options) {
    const selected = options.filter((option) => option.selected)

    if (!selected.length) {
      return game.i18n.localize('WOD6E.None')
    }

    return selected.map((option) => option.label).join(', ')
  }

  static _activateListeners(dialog, { actor }) {
    const element = dialog.element

    if (!element) return

    element.addEventListener('change', (event) => {
      if (!event.target.matches('.multi-select-section input')) return

      this._updatePreview(element, actor)
    })
  }

  static _updatePreview(element, actor) {
    if (!element || !actor) return

    const data = this._getDataFromForm(element)

    const previewContext = this._prepareContext({ actor, data }).test

    const testTextElement = element.querySelector('.roll-test')
    testTextElement.textContent = previewContext.testText

    const dicePoolElement = element.querySelector('.roll-pool-value')
    dicePoolElement.textContent = previewContext.dicePoolText

    const attributeElement = element.querySelector('.attribute-multi-select .multi-select-value')
    attributeElement.textContent = previewContext.selectedAttributesText

    const skillElement = element.querySelector('.skill-multi-select .multi-select-value')
    skillElement.textContent = previewContext.selectedSkillsText

    const disciplineElement = element.querySelector('.discipline-multi-select .multi-select-value')
    disciplineElement.textContent = previewContext.selectedDisciplinesText
  }

  static _getResult(form, { actor, item }) {
    const formData = this._getDataFromForm(form)

    return {
      actor,
      item,

      test: formData,
      testText: _getTestText(formData),
      dicePool: _calculateDicePool(actor, formData)
    }
  }

  static _getDataFromForm(form) {
    const attributes = Array.from(
      form.querySelectorAll('[data-field-path="attributes"] .multi-select-option input:checked')
    ).map((input) => input.value)
    const skills = Array.from(
      form.querySelectorAll('[data-field-path="skills"] .multi-select-option input:checked')
    ).map((input) => input.value)
    const disciplines = Array.from(
      form.querySelectorAll('[data-field-path="disciplines"] .multi-select-option input:checked')
    ).map((input) => input.value)

    return {
      attributes,
      skills,
      disciplines
    }
  }
}

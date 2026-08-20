import {
  _onDocumentPointerDown,
  _onToggleMultiSelect,
  _onToggleMultiSelectOption
} from '../fields/multiselect.js'
import { ItemUX } from '../items/scripts/item-ux.js'
import { WOD6eTest } from '../scripts/wod6e-test.js'
import { _calculateDicePool } from './scripts/calculate-dice-pool.js'
import { _getTestText } from './scripts/get-test-text.js'
import { resolveModifierValue } from '../actors/scripts/resolve-modifier-value.js'

const { DialogV2 } = foundry.applications.api
const { renderTemplate } = foundry.applications.handlebars

export class RollDialog {
  static TEMPLATE = 'systems/wod6e/templates/core/dialogs/roll-dialog.hbs'
  static customModifier = 0

  static async open(input = {}) {
    // Accept either an item directly or the existing options
    const isItem = input instanceof Item
    const item = isItem ? input : (input.item ?? null)
    const actor = isItem ? input.actor : (input.actor ?? item?.actor ?? null)
    const test = isItem ? {} : (input.test ?? {})

    if (!actor) {
      console.error('Roll Dialog requires an actor.')
      return
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
          action: 'roll',
          default: true,
          icon: 'fa-solid fa-dice-d10',
          label: game.i18n.localize('WOD6E.ROLL.Roll'),

          callback: async (_event, button) => {
            const data = this._getDataFromForm(button.form)
            const rollContext = this._prepareContext({ actor, data }).test

            return WOD6eTest.executeTest({
              actor,
              context: rollContext,
              flavor: rollContext.testText
            })
          }
        },
        {
          action: 'cancel',
          icon: 'fa-solid fa-xmark',
          label: game.i18n.localize('WOD6E.Cancel')
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

  static _prepareInitialData({ actor, item, test }) {
    // Determine whether we've been given an item or a non-item test
    const testData = item?.system?.test ?? test
    const configuredDifficulty = item?.system?.difficulty
    const difficulty = ['fixed', 'fixedPlusTargetsTrait'].includes(configuredDifficulty?.type)
      ? configuredDifficulty.fixed
      : testData?.difficulty

    const selectedTraits = {
      attributes: testData?.attributes || [],
      skills: testData?.skills || [],
      disciplines: testData?.disciplines || [],
      difficulty: Math.max(Number(difficulty) || 0, 0),
      itemModifier:
        resolveModifierValue(actor, testData?.modifier) *
        (testData?.modifier?.mode === 'subtract' ? -1 : 1)
    }

    return selectedTraits
  }

  static _prepareContext({ actor, item, data }) {
    const attributeOptions = this._prepareOptions({
      definitions: WOD6E.configs.Attributes.getList({ usePath: true }),
      selected: data?.attributes || []
    })

    const skillOptions = this._prepareOptions({
      definitions: WOD6E.configs.Skills.getList({ usePath: true }),
      selected: data?.skills || []
    })

    const disciplineOptions = this._prepareOptions({
      definitions: WOD6E.configs.Disciplines.getList({ usePath: true }),
      selected: data?.disciplines || []
    })

    const selectedAttributesText = this._getSelectedText(attributeOptions)
    const selectedSkillsText = this._getSelectedText(skillOptions)
    const selectedDisciplinesText = this._getSelectedText(disciplineOptions)

    const testText = _getTestText({
      attributeOptions,
      skillOptions,
      disciplineOptions,
      customModifier: (data?.itemModifier ?? 0) + this.customModifier
    })

    const dicePool = _calculateDicePool(actor, data)
    const difficulty = Math.max(Number(data?.difficulty) || 0, 0)
    const dicePoolText = game.i18n.format('WOD6E.ROLL.RollingString', {
      string: `${dicePool}d10`
    })

    return {
      actor,
      item,

      test: {
        // Raw test data used by the rules engine
        attributes: data?.attributes ?? [],
        skills: data?.skills ?? [],
        disciplines: data?.disciplines ?? [],
        action: data?.action ?? null,
        category: data?.category ?? null,
        itemModifier: data?.itemModifier ?? 0,
        difficulty,

        // Prepared display data
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
      // List of things we consider valid inputs
      if (
        event.target.matches('.multi-select-section input') ||
        event.target.matches('.custom-modifier-section input') ||
        event.target.matches('.difficulty-section input')
      ) {
        // Update the preview if any of the above inputs changed
        this._updatePreview(element, actor)
      }
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
    const customModifier = form.querySelector(
      '[data-field-path="customModifier"] input'
    ).valueAsNumber
    const difficulty = form.querySelector('[data-field-path="difficulty"] input').valueAsNumber
    const rollForm = form.matches('form') ? form : form.querySelector('form')
    const itemModifier = Number(rollForm?.dataset.itemModifier) || 0

    this.customModifier = customModifier

    return {
      attributes,
      skills,
      disciplines,
      itemModifier,
      customModifier,
      difficulty: Math.max(Number(difficulty) || 0, 0)
    }
  }
}

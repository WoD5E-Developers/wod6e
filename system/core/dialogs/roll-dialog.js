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
import { ActorEffects } from '../actors/scripts/actor-effects.js'

const { DialogV2 } = foundry.applications.api
const { renderTemplate } = foundry.applications.handlebars

export class RollDialog {
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
    const rendered = await renderTemplate(
      'systems/wod6e/templates/core/dialogs/roll-dialog.hbs',
      context
    )

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
      action: testData?.action ?? item?.system?.actionType ?? null,
      category: testData?.category ?? item?.system?.category ?? null,
      difficulty: Math.max(Number(difficulty) || 0, 0),
      itemModifier:
        resolveModifierValue(actor, testData?.modifier) *
        (testData?.modifier?.mode === 'subtract' ? -1 : 1),
      conditionEffectIds: null,
      focus: ''
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
    const focusOptions = this._prepareFocusOptions(actor, data?.skills, data?.focus)
    const selectedFocus = focusOptions.some((focus) => focus.selected) ? data.focus : ''

    const testText = _getTestText({
      attributeOptions,
      skillOptions,
      disciplineOptions,
      customModifier: (data?.itemModifier ?? 0) + this.customModifier + (selectedFocus ? 1 : 0)
    })

    const baseDicePool = _calculateDicePool(actor, { ...data, focus: selectedFocus })
    const difficulty = Math.max(Number(data?.difficulty) || 0, 0)
    const effectTest = {
      attribute: data?.attributes ?? [],
      skill: data?.skills ?? [],
      discipline: data?.disciplines ?? [],
      action: data?.action ?? null,
      category: data?.category ?? null,
      dicePool: baseDicePool,
      difficulty
    }

    const conditionEffects = this._prepareConditionEffects(actor, effectTest, data)
    effectTest.conditionEffectIds = conditionEffects
      .filter((effect) => effect.enabled)
      .map((effect) => effect.id)

    WOD6eTest.applyEffects(actor, effectTest)

    const dicePool = effectTest.dicePool
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
        focus: selectedFocus,
        conditionEffectIds: effectTest.conditionEffectIds,
        difficulty,
        baseDicePool,

        // Prepared display data
        attributeOptions,
        skillOptions,
        disciplineOptions,
        focusOptions,
        hasFocusOptions: focusOptions.length > 0,
        conditionEffects,
        hasConditionEffects: conditionEffects.length > 0,

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

  // Check if we should include any skill focuses from the actor
  static _prepareFocusOptions(actor, selectedSkills = [], selectedFocus = '') {
    return selectedSkills.flatMap((skillPath) => {
      const skill = foundry.utils.getProperty(actor, skillPath)
      const skillLabel = WOD6E.configs.Skills.getList({ usePath: true })[skillPath]?.displayName

      return (skill?.focuses ?? []).map((focus) => ({
        value: `${skillPath}:${focus}`,
        label: selectedSkills.length > 1 ? `${skillLabel}: ${focus}` : focus,
        selected: `${skillPath}:${focus}` === selectedFocus
      }))
    })
  }

  // Condition effect preparation, reusing some existing logic from our
  // main ActorEffects class with some suitable data mutation
  static _prepareConditionEffects(actor, test, data) {
    const selectedIds = Array.isArray(data?.conditionEffectIds)
      ? new Set(data.conditionEffectIds)
      : null

    return (actor.preparedEffects?.effects ?? [])
      .filter((effect) => effect.type === 'dice')
      .map((effect) => {
        const normallyApplies = ActorEffects.effectMatchesContext(effect, test)
        const value = ActorEffects.resolveEffectValue(actor, effect)
        const sign = effect.mode === 'subtract' ? '-' : effect.mode === 'add' ? '+' : '='

        return {
          id: effect.effectId,
          name: effect.sourceName,
          modifier: `${sign}${value}`,
          normallyApplies,
          enabled: selectedIds ? selectedIds.has(effect.effectId) : normallyApplies
        }
      })
  }

  static _activateListeners(dialog, { actor }) {
    const element = dialog.element

    if (!element) return

    element.addEventListener('change', (event) => {
      // List of things we consider valid inputs
      if (
        event.target.matches('.multi-select-section input') ||
        event.target.matches('.custom-modifier-section input') ||
        event.target.matches('.difficulty-section input') ||
        event.target.matches('.roll-focus-select') ||
        event.target.matches('.condition-effect-toggle')
      ) {
        // Update the preview if any of the above inputs changed
        this._updatePreview(element, actor)
      }
    })
  }

  // This entire thing is basically one big find-and-replace function
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

    this._replaceSidePanel(element, previewContext)
  }

  // Since the side panel is-but-isn't a "part" of the roll dialog,
  // we do this so that we can rerender it with new data when we do things
  // like update the currently active skill/attribute/etc
  // It's also nicer to track this separate from the "main context" of
  // the roll dialog
  static async _replaceSidePanel(element, context) {
    const currentPanel = element.querySelector('.roll-dialog-side-panel')
    if (!currentPanel) return

    const rendered = await renderTemplate(
      'systems/wod6e/templates/core/dialogs/roll-dialog-side-panel.hbs',
      { test: context }
    )
    const wrapper = document.createElement('div')
    wrapper.innerHTML = rendered
    currentPanel.replaceWith(wrapper.firstElementChild)
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
    const focus = form.querySelector('[name="focus"]')?.value ?? ''
    const conditionEffectIds = Array.from(
      form.querySelectorAll('.condition-effect-toggle:checked')
    ).map((input) => input.value)
    const rollForm = form.matches('form') ? form : form.querySelector('form')
    const itemModifier = Number(rollForm?.dataset.itemModifier) || 0

    this.customModifier = customModifier

    return {
      attributes,
      skills,
      disciplines,
      itemModifier,
      customModifier,
      focus,
      conditionEffectIds,
      difficulty: Math.max(Number(difficulty) || 0, 0)
    }
  }
}

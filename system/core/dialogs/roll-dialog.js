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
import { hasDifferentApproach } from '../scripts/test-resolution.js'
import { getHunger, hasBeast } from '../actors/scripts/vitae.js'
import { canPayCost, getItemCost } from '../actors/scripts/resource-spending.js'
import {
  getActivePath,
  getHumanityRank,
  getHumanityModifier
} from '../../splats/vampire/scripts/humanity.js'

const { DialogV2 } = foundry.applications.api
const { renderTemplate } = foundry.applications.handlebars

export class RollDialog {
  /**
   * Method to open the roll dialog
   *
   * Expects at minimum an instance of an actor;
   *
   * Additionally, to pre-fill the selection inputs, an item with a test
   * or a test object with skills, attributes, or disciplines (each arrays)
   * is needed.
   */
  static async open(
    input = {
      actor: null,
      item: null,
      test: {
        attributes: [],
        skills: [],
        disciplines: []
      }
    }
  ) {
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
          disabled: !context.test.canRoll,
          callback: (_event, button) => this._submitTest(button.form, actor, 'roll', item)
        },
        {
          action: 'takeHalf',
          icon: 'fa-solid fa-divide',
          label: game.i18n.localize('WOD6E.ROLL.TakeHalf'),
          tooltip: 'WOD6E.ROLL.TakingHalfHint',
          disabled: !context.test.canTakeHalf,
          callback: (_event, button) => this._submitTest(button.form, actor, 'takeHalf', item)
        },
        {
          action: 'cancel',
          type: 'button',
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

  static async _submitTest(form, actor, resolutionMode, item) {
    const data = this._getDataFromForm(form)
    data.includeDifficulty = true
    data.resolutionMode = resolutionMode
    const context = this._prepareContext({ actor, item, data }).test
    if (!context.canRoll || (resolutionMode === 'takeHalf' && !context.canTakeHalf)) return

    return WOD6eTest.executeTest({ actor, item, context, flavor: context.testText })
  }

  /**
   * Prepares the data when the roll dialog opens, accepting a given
   * actor, an item, and a test object, preferring the item's configured
   * test if both are provided
   */
  static _prepareInitialData({ actor, item, test }) {
    // Determine whether we've been given an item or a non-item test
    const testData = item?.system?.test ?? test
    const configuredDifficulty = item?.system?.difficulty
    const difficulty = ['fixed', 'fixedPlusTargetsTrait'].includes(configuredDifficulty?.type)
      ? configuredDifficulty.fixed
      : testData?.difficulty

    const selectedTraits = {
      attributes: this._prepareSelectedTraits(WOD6E.configs.Attributes, testData?.attributes),
      skills: this._prepareSelectedTraits(WOD6E.configs.Skills, testData?.skills),
      disciplines: this._prepareSelectedTraits(WOD6E.configs.Disciplines, testData?.disciplines),
      action: testData?.action ?? item?.flags?.wod6e?.dataItemId ?? null,
      category:
        testData?.category ??
        item?.system?.actionType ??
        item?.system?.category ??
        item?.system?.attribute ??
        null,
      attributeMode: testData?.attributeMode ?? (item ? 'any' : 'all'),
      skillMode: testData?.skillMode ?? (item ? 'any' : 'all'),
      disciplineMode: testData?.disciplineMode ?? (item ? 'any' : 'all'),
      testType: testData?.testType ?? 'standard',
      resolutionMode: 'roll',
      hungerDice: testData?.hungerDice ?? actor.system?.hunger?.value ?? 0,
      bargainRule: testData?.bargainRule ?? 'standard',
      itemUuid: item?.uuid ?? testData?.itemUuid ?? '',
      retryOf: testData?.retryOf ?? '',
      isAttack: testData?.isAttack ?? item?.system?.role === 'attack',
      isDefense: testData?.isDefense ?? item?.system?.role === 'defense',
      inConflict: testData?.inConflict ?? false,
      resistBeast: testData?.resistBeast ?? false,
      frenzyType: testData?.frenzyType ?? '',
      humanityModifier: testData?.humanityModifier ?? false,
      difficulty: Math.max(difficulty ?? 1, 0),
      itemModifier: testData?.retryOf
        ? (testData.itemModifier ?? 0)
        : resolveModifierValue(actor, testData?.modifier) *
          (testData?.modifier?.mode === 'subtract' ? -1 : 1),
      conditionEffectIds: null,
      focus: ''
    }

    for (const [group, mode] of [
      ['attributes', 'attributeMode'],
      ['skills', 'skillMode'],
      ['disciplines', 'disciplineMode']
    ]) {
      if (selectedTraits[mode] === 'any') selectedTraits[group] = []
    }

    return selectedTraits
  }

  /**
   * Accepts a World of Darkness 6e config list as well as a
   * list of traits, typically in the form of a Set
   *
   * Returns the formatted list of traits with the paths
   */
  static _prepareSelectedTraits(config, selected = []) {
    const definitions = config.getList({})

    return Array.from(selected ?? [], (key) => definitions[key]?.path ?? key)
  }

  /**
   * Context preparation function for the entire roll dialog;
   *
   * Given an actor, an item, and data pulled from form inputs
   * (which in reality is just any selected attributes/skills/disciplines
   * plus other inputs like difficulty and custom modifier)
   * it will return the full prepared context with things like
   * the dicepool, the localized and formatted text (Athletics (1) + Strength (2) vs...)
   *
   * This also handles applying any effects from currently configured (and enabled)
   * conditions.
   */
  static _prepareContext({ actor, item, data }) {
    data = { ...data }
    const traitOptions = {}
    let canRoll = true
    for (const [group, mode, config] of [
      ['attributes', 'attributeMode', WOD6E.configs.Attributes],
      ['skills', 'skillMode', WOD6E.configs.Skills],
      ['disciplines', 'disciplineMode', WOD6E.configs.Disciplines]
    ]) {
      const singleSelect = data[mode] === 'any'
      const options = this._prepareOptions({
        actor,
        definitions: config.getList({ usePath: true }),
        selected: data[group] ?? [],
        allowed:
          item && singleSelect
            ? this._prepareSelectedTraits(config, item.system?.test?.[group])
            : null
      })

      if (singleSelect) {
        const selected =
          options.length === 1 ? options[0] : options.find((option) => option.selected)
        for (const option of options) option.selected = option === selected
        data[group] = selected ? [selected.key] : []
        if (options.length && !selected) canRoll = false
      }
      traitOptions[group] = options
    }
    const {
      attributes: attributeOptions,
      skills: skillOptions,
      disciplines: disciplineOptions
    } = traitOptions

    const selectedAttributesText = this._getSelectedText(attributeOptions)
    const selectedSkillsText = this._getSelectedText(skillOptions)
    const selectedDisciplinesText = this._getSelectedText(disciplineOptions)
    const focusOptions = this._prepareFocusOptions(actor, data?.skills, data?.focus)
    const selectedFocus = focusOptions.some((focus) => focus.selected) ? data.focus : ''

    const baseDicePool = _calculateDicePool(
      actor,
      { ...data, focus: selectedFocus },
      { clamp: false }
    )
    const retrySource = data.retryOf ? game.messages.get(data.retryOf) : null
    const previous = retrySource?.rolls?.[0]
    if (data.retryOf) {
      canRoll &&= Boolean(
        game.user.isGM &&
        previous?.canRetry &&
        !retrySource.getFlag('wod6e', 'retryUsed') &&
        hasDifferentApproach(previous.options, data)
      )
    }
    const difficulty = previous
      ? previous.options.difficulty + 1
      : Math.max(data?.difficulty ?? 1, 0)
    const testType = (data?.testType ?? 'standard') === 'standard' ? 'standard' : 'unopposed'
    const resolutionMode = data?.resolutionMode === 'takeHalf' ? 'takeHalf' : 'roll'
    const effectTest = {
      attribute: data?.attributes ?? [],
      skill: data?.skills ?? [],
      discipline: data?.disciplines ?? [],
      action: data?.action ?? null,
      category: data?.category ?? null,
      dicePool: baseDicePool,
      resistBeast: data.resistBeast,
      frenzyType: data.frenzyType,
      humanityModifier: data.humanityModifier,
      difficulty
    }

    // Conditions can be force-enabled or force-disabled on the roll dialog
    const conditionEffects = this._prepareConditionEffects(actor, effectTest, data)
    effectTest.conditionEffectIds = conditionEffects
      .filter((effect) => effect.enabled)
      .map((effect) => effect.id)

    const testText = _getTestText({
      attributeOptions,
      skillOptions,
      disciplineOptions,
      customModifier:
        (data?.itemModifier ?? 0) + (data?.customModifier ?? 0) + (selectedFocus ? 1 : 0),
      effects: conditionEffects.filter((effect) => effect.enabled),

      // By default we don't include difficulty, unless we're using context preparation for
      // the chat card, then we pass true for this
      includeDifficulty: data.includeDifficulty ?? false,
      difficulty,
      testType
    })

    WOD6eTest.applyEffects(actor, effectTest)

    const dicePool = Math.max(effectTest.dicePool, 0)
    const dicePoolText = game.i18n.format('WOD6E.ROLL.RollingString', { string: `${dicePool}d10` })
    const costItem = item ?? (data.itemUuid ? fromUuidSync(data.itemUuid) : null)
    const cost = getItemCost(costItem)
    canRoll &&= canPayCost(actor, cost)
    const hungerDice = actor.system.vitae
      ? getHunger(actor, actor.system.vitae.value - (cost?.resource === 'vitae' ? cost.amount : 0))
      : Math.max(0, Math.min(5, Math.floor(Number(data.hungerDice) || 0)))

    return {
      actor,
      item,

      test: {
        // Raw test data used by the rules engine
        attributes: data?.attributes ?? [],
        skills: data?.skills ?? [],
        disciplines: data?.disciplines ?? [],
        attributeMode: data?.attributeMode ?? 'all',
        skillMode: data?.skillMode ?? 'all',
        disciplineMode: data?.disciplineMode ?? 'all',
        testType,
        resolutionMode,
        hungerDice,
        hasBeast: hasBeast(actor),
        hasHumanity: hasBeast(actor) && Boolean(actor.system.vampire?.humanity),
        humanityName: getActivePath(actor).name,
        humanityRank: getHumanityRank(actor),
        humanityRankModifier: getHumanityModifier(getHumanityRank(actor)),
        humanityModifier: data.humanityModifier ?? false,
        humanityCap: effectTest.humanityCap,
        resistBeast: Boolean(data.resistBeast || data.frenzyType),
        frenzyType: data.frenzyType ?? '',
        showHunger: hasBeast(actor) || hungerDice > 0,
        hungerAutomatic: Boolean(actor.system.vitae),
        itemUuid: costItem?.uuid ?? data.itemUuid ?? '',
        costAmount: cost?.amount ?? 0,
        costLabel: cost
          ? `WOD6E.RESOURCES.${cost.resource[0].toUpperCase()}${cost.resource.slice(1)}`
          : '',
        canAffordCost: canPayCost(actor, cost),
        bargainRule: data.bargainRule ?? 'standard',
        retryOf: data.retryOf ?? '',
        isAttack: data?.isAttack ?? false,
        isDefense: data?.isDefense ?? false,
        inConflict: data?.inConflict ?? false,
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
        isStandard: testType === 'standard',
        canRoll,
        canTakeHalf:
          canRoll &&
          (actor.type === 'npc' ||
            !(data?.inConflict || data?.isAttack || data?.isDefense || data?.frenzyType)),
        testTypeOptions: {
          standard: 'WOD6E.ROLL.FixedDifficulty',
          unopposed: 'WOD6E.ROLL.CountSuccesses'
        },

        selectedAttributesText,
        selectedSkillsText,
        selectedDisciplinesText,

        testText,
        dicePool,
        dicePoolText
      }
    }
  }

  /**
   * Little helper to prevent having to do write this out three times
   * for each set of options from a given selection and definition config
   */
  static _prepareOptions({ actor, definitions, selected = [], allowed = null }) {
    const selectedKeys = new Set(selected)
    const allowedKeys = allowed === null ? null : new Set(allowed)

    return Object.entries(definitions)
      .filter(([key, def]) => !def.hidden && (!allowedKeys || allowedKeys.has(key)))
      .map(([key, def]) => ({
        key,
        label: def.displayName,
        value: Number(foundry.utils.getProperty(actor, `${key}.effective`)) || 0,
        selected: selectedKeys.has(key)
      }))
  }

  /**
   * Another little helper that takes a given list of selections and spits out
   * a comma-separated list or "None" if the input is empty
   */
  static _getSelectedText(options) {
    const selected = options.filter((option) => option.selected)

    if (!selected.length) {
      return game.i18n.localize('WOD6E.None')
    }

    return selected.map((option) => option.label).join(', ')
  }

  /**
   * Check if we should include any skill focuses from the actor
   *
   * Takes the actor, any selected skills, any already selected focuses and
   * returns a nicely formatted list for our Focuses dropdown
   */
  static _prepareFocusOptions(actor, selectedSkills = [], selectedFocus = '') {
    const skillPaths = Array.from(selectedSkills ?? [])

    return skillPaths.flatMap((skillPath) => {
      const skill = foundry.utils.getProperty(actor, skillPath)
      const skillLabel = WOD6E.configs.Skills.getList({ usePath: true })[skillPath]?.displayName

      return (skill?.focuses ?? []).map((focus) => ({
        value: `${skillPath}:${focus}`,
        label: skillPaths.length > 1 ? `${skillLabel}: ${focus}` : focus,
        selected: `${skillPath}:${focus}` === selectedFocus
      }))
    })
  }

  /**
   * Condition effect preparation, reusing some existing logic from our
   * main ActorEffects class with some suitable data mutation
   */
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

  /**
   * Force re-render when certain inputs are updated
   *
   * This is one trade-off of using a dialog instead of, you know,
   * an actual application. An actual application was overengineered for
   * this despite the fact that it would've made partial rerendering possible
   *
   * Choose your battles
   */
  static _activateListeners(dialog, { actor, item }) {
    const element = dialog.element

    if (!element) return

    element.addEventListener('change', (event) => {
      // List of things we consider valid inputs
      if (
        event.target.matches('.multi-select-section input') ||
        event.target.matches('.roll-trait-select select') ||
        event.target.matches('.custom-modifier-section input') ||
        event.target.matches('.difficulty-section input') ||
        event.target.matches('[name="testType"]') ||
        event.target.matches('.roll-focus-select') ||
        event.target.matches('.condition-effect-toggle') ||
        event.target.matches('[name="humanityModifier"], [name="resistBeast"]') ||
        event.target.matches('[name="hungerDice"]')
      ) {
        // Update the preview if any of the above inputs changed
        this._updatePreview(element, actor, item)
      }
    })
  }

  /**
   * This entire thing is basically one big find-and-replace function
   *
   * Efficient? No. But it's not worth worrying about because it's all
   * just a text replacement
   *
   * If we find performance issues with this later, we can likely batch all these updates and just
   * replace the entire window (or just the window content)
   */
  static _updatePreview(element, actor, item) {
    if (!element || !actor) return

    const data = this._getDataFromForm(element)

    const previewContext = this._prepareContext({ actor, item, data }).test

    const testTextElement = element.querySelector('.roll-test')
    testTextElement.textContent = previewContext.testText

    const dicePoolElement = element.querySelector('.roll-pool-value')
    dicePoolElement.textContent = previewContext.dicePoolText

    for (const fieldset of element.querySelectorAll('[data-resolution-section]')) {
      const active = fieldset.dataset.resolutionSection === previewContext.testType
      fieldset.hidden = !active
      fieldset.disabled = !active
    }
    const rollButton = element.querySelector('button[data-action="roll"]')
    if (rollButton) rollButton.disabled = !previewContext.canRoll
    const takeHalfButton = element.querySelector('button[data-action="takeHalf"]')
    if (takeHalfButton) takeHalfButton.disabled = !previewContext.canTakeHalf

    const attributeElement = element.querySelector('.attribute-multi-select .multi-select-value')
    if (attributeElement) attributeElement.textContent = previewContext.selectedAttributesText

    const skillElement = element.querySelector('.skill-multi-select .multi-select-value')
    if (skillElement) skillElement.textContent = previewContext.selectedSkillsText

    const disciplineElement = element.querySelector('.discipline-multi-select .multi-select-value')
    if (disciplineElement) disciplineElement.textContent = previewContext.selectedDisciplinesText

    this._replaceSidePanel(element, previewContext)
  }

  /**
   * Since the side panel is-but-isn't a "part" of the roll dialog,
   * we do this so that we can rerender it with new data when we do things
   * like update the currently active skill/attribute/etc
   *
   * It's also nicer to track this separate from the "main context" of
   * the roll dialog
   */
  static async _replaceSidePanel(element, context) {
    if (!element.querySelector('.roll-dialog-side-panel')) return
    const requestId = (Number(element.dataset.sidePanelRequestId) || 0) + 1
    element.dataset.sidePanelRequestId = String(requestId)

    const rendered = await renderTemplate(
      'systems/wod6e/templates/core/dialogs/roll-dialog-side-panel.hbs',
      { test: context }
    )
    if (element.dataset.sidePanelRequestId !== String(requestId)) return

    const currentPanel = element.querySelector('.roll-dialog-side-panel')
    if (!currentPanel) return
    const wrapper = document.createElement('div')
    wrapper.innerHTML = rendered
    currentPanel.replaceWith(wrapper.firstElementChild)
  }

  /**
   * Given the formdata, this is a simple function that ties the other
   * functions together to give us the dice results
   */
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

  /**
   * Another downside of not using an application, but we basically do query selectors to grab the data we need
   * from all the form values on this entire window
   *
   * Note for the future: Any new fields on the Roll Dialog need to be added here too
   *
   * If something breaks, it's probably here
   */
  static _getDataFromForm(form) {
    const readTraits = (group) => {
      const field = form.querySelector(`[data-field-path="${group}"]`)
      const select = field?.querySelector('select')
      if (select) return select.value ? [select.value] : []
      return Array.from(field?.querySelectorAll('.multi-select-option input:checked') ?? []).map(
        (input) => input.value
      )
    }
    const attributes = readTraits('attributes')
    const skills = readTraits('skills')
    const disciplines = readTraits('disciplines')
    const customModifier = form.querySelector(
      '[data-field-path="customModifier"] input'
    ).valueAsNumber
    const difficulty = form.querySelector('[name="difficulty"]').valueAsNumber
    const focus = form.querySelector('[name="focus"]')?.value ?? ''
    const conditionEffectIds = Array.from(
      form.querySelectorAll('.condition-effect-toggle:checked')
    ).map((input) => input.value)
    const rollForm = form.matches('[data-item-modifier]')
      ? form
      : form.querySelector('[data-item-modifier]')
    const itemModifier = Number(rollForm?.dataset.itemModifier) || 0
    const action = rollForm?.dataset.testAction || null
    const category = rollForm?.dataset.testCategory || null
    const testType = form.querySelector('select[name="testType"]')?.value ?? 'standard'

    return {
      attributes,
      skills,
      disciplines,
      attributeMode: rollForm?.dataset.attributeMode ?? 'all',
      skillMode: rollForm?.dataset.skillMode ?? 'all',
      disciplineMode: rollForm?.dataset.disciplineMode ?? 'all',
      testType,
      resolutionMode: 'roll',
      hungerDice: form.querySelector('[name="hungerDice"]')?.valueAsNumber ?? 0,
      bargainRule: rollForm?.dataset.bargainRule ?? 'standard',
      itemUuid: rollForm?.dataset.itemUuid ?? '',
      retryOf: rollForm?.dataset.retryOf ?? '',
      isAttack: rollForm?.dataset.isAttack === 'true',
      isDefense: rollForm?.dataset.isDefense === 'true',
      inConflict: rollForm?.dataset.inConflict === 'true',
      resistBeast: form.querySelector('[name="resistBeast"]')?.checked ?? false,
      humanityModifier: form.querySelector('[name="humanityModifier"]')?.checked ?? false,
      frenzyType: rollForm?.dataset.frenzyType ?? '',
      itemModifier,
      action,
      category,
      customModifier,
      focus,
      conditionEffectIds,
      difficulty: Math.max(Number(difficulty) || 0, 0)
    }
  }
}

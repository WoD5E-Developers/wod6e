import { prepareMultiSelect } from '../../fields/multiselect.js'
import { getTargetOptions } from './get-target-options.js'

export const prepareConditionDetailsContext = async function (context, item) {
  const itemData = item.system
  const condition = itemData?.condition ?? {}

  // Tab data
  context.tab = context.tabs.condition

  // Part-specific data
  context.condition = condition

  return context
}

export const prepareConditionEffectsContext = async function (context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.effects

  // Part-specific data
  context.effects = (itemData?.effects ?? []).map((effect) => {
    // Special cases where some effect types need a different dropdown list
    const targetTypesByEffect = {
      resource: ['resources'],
      resourceMaximum: ['resources']
    }
    // Otherwise, this is the default - attributes, skills, disciplines
    const targetTypes = targetTypesByEffect[effect.type] ?? ['attributes', 'skills', 'disciplines']
    // Targets (using the above logic to determine what targetTypes is)
    const targets = prepareMultiSelect(effect.targets, getTargetOptions(targetTypes))
    // Predicates
    const predicates = prepareMultiSelect(
      effect.predicates,
      getTargetOptions(['attributes', 'skills', 'disciplines'])
    )
    // Exclusions
    const exclusions = prepareMultiSelect(
      effect.exclusions,
      getTargetOptions(['attributes', 'skills', 'disciplines'])
    )

    return {
      ...effect,

      targetOptions: targets.options,
      selectedTargetsText: targets.selectedText,

      predicateOptions: predicates.options,
      selectedPredicatesText: predicates.selectedText,

      exclusionOptions: exclusions.options,
      selectedExclusionsText: exclusions.selectedText
    }
  })

  context.effectTypeOptions = {
    dice: 'WOD6E.CONDITIONS.Dice',
    baseDifficulty: 'WOD6E.CONDITIONS.BaseDifficulty',
    difficulty: 'WOD6E.CONDITIONS.Difficulty',
    cost: 'WOD6E.ITEMS.Cost',

    basicSuccess: 'WOD6E.CONDITIONS.BasicSuccess',
    automaticSuccess: 'WOD6E.CONDITIONS.AutomaticSuccess',
    automaticFailure: 'WOD6E.CONDITIONS.AutomaticFailure',

    damage: 'WOD6E.CONDITIONS.Damage',
    damageReduction: 'WOD6E.CONDITIONS.DamageReduction',

    resource: 'WOD6E.CONDITIONS.Resource',
    resourceMaximum: 'WOD6E.CONDITIONS.ResourceMaximum'
  }

  context.effectModeOptions = {
    add: 'WOD6E.Add',
    subtract: 'WOD6E.Subtract',
    override: 'WOD6E.Override'
  }

  return context
}

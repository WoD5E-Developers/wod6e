import { prepareMultiSelect } from '../../fields/multiselect.js'
import { getTargetOptions } from './get-targets-for-effect-type.js'

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
    // Targets
    const targets = prepareMultiSelect(effect.targets, getTargetOptions(effect.type))
    // Predicates
    const predicates = prepareMultiSelect(effect.predicates, getTargetOptions('predicate'))

    return {
      ...effect,

      excludesText: (effect.excludes ?? []).join(', '),

      targetOptions: targets.options,
      selectedTargetsText: targets.selectedText,

      predicateOptions: predicates.options,
      selectedPredicatesText: predicates.selectedText
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

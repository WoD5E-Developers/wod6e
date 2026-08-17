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
    const targets = prepareMultiSelect(
      effect.targets,
      getTargetOptions({ types: targetTypes, usePaths: true })
    )
    // Predicates
    const predicates = prepareMultiSelect(
      effect.predicates,
      getTargetOptions({ types: ['attributes', 'skills', 'disciplines'], usePaths: true })
    )
    // Exclusions
    const exclusions = prepareMultiSelect(
      effect.exclusions,
      getTargetOptions({ types: ['attributes', 'skills', 'disciplines'], usePaths: true })
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

  context.effectTypeOptions = WOD6E.configs.EffectTypes.getList({})

  context.effectModeOptions = {
    add: 'WOD6E.Add',
    subtract: 'WOD6E.Subtract',
    override: 'WOD6E.Override'
  }

  return context
}

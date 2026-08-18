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

  // Prepare these once, we don't need to prep them for each individual effect
  // since the types are static
  const predicateOptions = await getTargetOptions({
    types: ['attributes', 'skills', 'disciplines', 'items'],
    usePaths: true,
    actor: item.actor
  })
  const exclusionOptions = await getTargetOptions({
    types: ['attributes', 'skills', 'disciplines', 'items'],
    usePaths: true
  })

  // Part-specific data
  context.effects = await Promise.all(
    (itemData?.effects ?? []).map(async (effect) => {
      // Special cases where some effect types need a different dropdown list
      const targetTypesByEffect = {
        resource: ['resources'],
        resourceMaximum: ['resources']
      }

      // Otherwise: attributes, skills, disciplines
      const targetTypes = targetTypesByEffect[effect.type] ?? [
        'attributes',
        'skills',
        'disciplines'
      ]

      const targetOptions = await getTargetOptions({
        types: targetTypes,
        usePaths: true,
        actor: item.actor
      })
      const targets = prepareMultiSelect(effect.targets, targetOptions)
      const predicates = prepareMultiSelect(effect.predicates, predicateOptions)
      const exclusions = prepareMultiSelect(effect.exclusions, exclusionOptions)

      return {
        ...effect,

        targetOptions: targets.options,
        targetGroups: targets.groups,
        selectedTargetsText: targets.selectedText,

        predicateOptions: predicates.options,
        predicateGroups: predicates.groups,
        selectedPredicatesText: predicates.selectedText,

        exclusionOptions: exclusions.options,
        exclusionGroups: exclusions.groups,
        selectedExclusionsText: exclusions.selectedText
      }
    })
  )

  context.effectTypeOptions = WOD6E.configs.EffectTypes.getList({})

  context.effectModeOptions = {
    add: 'WOD6E.Add',
    subtract: 'WOD6E.Subtract',
    override: 'WOD6E.Override'
  }

  return context
}

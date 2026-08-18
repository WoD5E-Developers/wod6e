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
  const effectTypes = WOD6E.configs.EffectTypes.getList({})

  const predicateOptions = await getTargetOptions({
    types: ['attributes', 'skills', 'disciplines', 'items'],
    usePaths: true,
    actor: item.actor
  })

  const exclusionOptions = await getTargetOptions({
    types: ['attributes', 'skills', 'disciplines', 'items'],
    usePaths: true
  })

  // Special cases where some effect types use different target types
  const targetTypesByEffect = {
    resource: ['resources'],
    resourceMaximum: ['resources']
  }

  // Part-specific data
  context.effects = await Promise.all(
    (itemData?.effects ?? []).map(async (effect) => {
      const effectTypeData = effectTypes[effect.type]

      const effectUsesTargets = effectTypeData?.showTargets ?? false
      const effectUsesValueFields = effectTypeData?.showValueFields ?? false
      const effectUsesPredicates = effectTypeData?.showPredicates ?? false
      const effectUsesExclusions = effectTypeData?.showExclusions ?? false

      let targets = null
      let predicates = null
      let exclusions = null

      if (effectUsesTargets) {
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

        targets = prepareMultiSelect(effect.targets, targetOptions)
      }

      if (effectUsesPredicates) {
        predicates = prepareMultiSelect(effect.predicates, predicateOptions)
      }

      if (effectUsesExclusions) {
        exclusions = prepareMultiSelect(effect.exclusions, exclusionOptions)
      }

      return {
        ...effect,

        effectUsesTargets,
        effectUsesValueFields,
        effectUsesPredicates,
        effectUsesExclusions,

        targetOptions: targets?.options ?? [],
        targetGroups: targets?.groups ?? [],
        selectedTargetsText: targets?.selectedText ?? '',

        predicateOptions: predicates?.options ?? [],
        predicateGroups: predicates?.groups ?? [],
        selectedPredicatesText: predicates?.selectedText ?? '',

        exclusionOptions: exclusions?.options ?? [],
        exclusionGroups: exclusions?.groups ?? [],
        selectedExclusionsText: exclusions?.selectedText ?? ''
      }
    })
  )

  context.effectTypeOptions = effectTypes

  context.effectModeOptions = {
    add: 'WOD6E.Add',
    subtract: 'WOD6E.Subtract',
    override: 'WOD6E.Override'
  }

  return context
}

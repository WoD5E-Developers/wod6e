export async function prepareActionTestsContext(context, item) {
  // Tab data
  context.tab = context.tabs.tests

  context.tests = item.system.tests ?? []

  return context
}

export async function prepareActionDifficultyContext(context, item) {
  // Tab data
  context.tab = context.tabs.difficulty

  context.difficulty = item.system.difficulty || ''
  const difficultyType = context.actionDifficultyOptions[context.difficulty]

  context.showFixedDifficulty = difficultyType?.usesFixedValue ?? false
  context.showAttributeSelector = difficultyType?.usesAttribute ?? false
  context.showNpcLevel = difficultyType?.supportsNpc ?? false

  return context
}

export async function prepareActionActivationContext(context, item) {
  // Tab data
  context.tab = context.tabs.activation

  context.distance = item.system.distance

  return context
}

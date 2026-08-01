export const prepareHeaderContext = async function (context, actor) {
  const actorData = actor.system

  context.name = actor.name
  context.archetype = actorData.archetype
  context.age = actorData.age
  context.vampire = actorData.vampire

  return context
}

export const prepareHumanityScaleContext = async function (context, actor) {
  const actorData = actor.system

  return context
}

export const prepareLeftColumnContext = async function (context, actor) {
  const actorData = actor.system

  return context
}

export const prepareMiddleColumnContext = async function (context, actor) {
  const actorData = actor.system

  return context
}

export const prepareRightColumnContext = async function (context, actor) {
  const actorData = actor.system

  return context
}

export const prepareDisciplinesContext = async function (context, actor) {
  const actorData = actor.system

  return context
}

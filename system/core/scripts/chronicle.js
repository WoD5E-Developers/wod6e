export const chronicleSetting = 'masqueradeScopes'
export const chronicleTimeInitialized = 'chronicleTimeInitialized'
export const defaultScopes = [{ id: 'chronicle', name: '', value: 0 }]
export const boundaries = ['scene', 'night', 'day', 'session']

export function chronicleLabel(key, data) {
  const id = `WOD6E.CHRONICLE.${key}`
  return data ? game.i18n.format(id, data) : game.i18n.localize(id)
}

export function isChronicleStoryteller() {
  return game.user.isGM && game.users.activeGM?.id === game.user.id
}

export async function initializeChronicleTime() {
  if (!isChronicleStoryteller() || game.settings.get('wod6e', chronicleTimeInitialized)) return

  // Foundry seeds new worlds with a saved time of zero, so this
  // basically just sets the time to the current year + month
  // as a default rather than 0
  if (game.time.worldTime === 0) {
    const now = new Date()
    const { calendar } = game.time
    const lastMonth = (calendar.months?.values?.length ?? 1) - 1
    const timestamp = calendarDate(calendar, {
      year: now.getFullYear(),
      month: Math.min(now.getMonth(), Math.max(0, lastMonth)),
      day: 1,
      hour: 0,
      minute: 0,
      second: 0
    })

    if (timestamp === null) return

    await game.time.set(timestamp)
  }

  await game.settings.set('wod6e', chronicleTimeInitialized, true)
}

export function getScopes() {
  return game.settings.get('wod6e', chronicleSetting).scopes.map((scope) => ({
    ...scope,
    label: scope.id === 'chronicle' ? chronicleLabel('Chronicle') : scope.name
  }))
}

export function saveScopes(scopes) {
  if (!isChronicleStoryteller()) return

  return game.settings.set('wod6e', chronicleSetting, {
    scopes: scopes.map(({ id, name, value, reference }) => ({ id, name, value, reference }))
  })
}

export async function adjustMasquerade(id, delta, reference) {
  if (!isChronicleStoryteller()) return

  const scopes = getScopes()
  const scope = scopes.find((entry) => entry.id === id)

  if (!scope) return
  const value = Math.max(0, Math.min(10, scope.value + delta))

  if (value === scope.value) return
  Object.assign(scope, { value, reference: reference ?? null })

  await saveScopes(scopes)
}

export function getExpiringConditions(boundary, scene) {
  if (!boundaries.includes(boundary)) return []

  const actors = new Map()

  if (boundary !== 'scene') {
    for (const actor of game.actors) actors.set(actor.uuid, actor)
  }

  for (const location of boundary === 'scene' ? (scene ? [scene] : []) : game.scenes) {
    for (const token of location.tokens) {
      const actor = token.actor
      if (actor) actors.set(actor.uuid, actor)
    }
  }

  return Array.from(actors.values()).flatMap((actor) =>
    actor.items
      .filter((item) => item.type === 'condition' && item.system.condition?.duration === boundary)
      .map((item) => ({ actor, item }))
  )
}

export async function expireConditions(boundary, entries) {
  if (!isChronicleStoryteller() || !boundaries.includes(boundary)) return

  const byActor = new Map()

  for (const { actor, item } of entries) {
    if (!byActor.has(actor)) byActor.set(actor, [])
    byActor.get(actor).push(item.id)
  }

  for (const [actor, ids] of byActor) {
    // A base actor deletion may already have removed an inherited condition from a token.
    const currentActor = actor.token?.actor ?? actor
    const matching = ids.filter((id) => {
      const item = currentActor.items.get(id)
      return item?.type === 'condition' && item.system.condition?.duration === boundary
    })
    if (matching.length) await currentActor.deleteEmbeddedDocuments('Item', matching)
  }
}

export function calendarDate(calendar, { year, month, day, hour, minute, second }) {
  const leap = calendar.isLeapYear(year)
  const months = calendar.months?.values ?? []
  const lengths = months.map((entry) => (leap ? (entry.leapDays ?? entry.days) : entry.days))
  const limit = months.length
    ? lengths[month]
    : leap
      ? calendar.days.daysPerLeapYear
      : calendar.days.daysPerYear
  if (
    ![year, month, day, hour, minute].every(Number.isInteger) ||
    day < 1 ||
    day > (limit ?? 0) ||
    hour < 0 ||
    hour >= calendar.days.hoursPerDay ||
    minute < 0 ||
    minute >= calendar.days.minutesPerHour
  )
    return null
  const dayOfYear = lengths.slice(0, month).reduce((total, length) => total + length, day - 1)
  const timestamp = calendar.componentsToTime({ year, day: dayOfYear, hour, minute, second })
  return Number.isSafeInteger(Math.trunc(timestamp)) ? timestamp : null
}

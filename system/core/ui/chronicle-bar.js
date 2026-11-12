import {
  adjustMasquerade,
  boundaries,
  calendarDate,
  chronicleLabel as label,
  chronicleSetting,
  chronicleTimeInitialized,
  defaultScopes,
  expireConditions,
  getExpiringConditions,
  getScopes,
  isChronicleStoryteller,
  saveScopes
} from '../scripts/chronicle.js'

const boundaryLabels = {
  scene: 'EndScene',
  night: 'EndNight',
  day: 'EndDay',
  session: 'EndSession'
}
const clockFormatSetting = 'chronicleClockFormat'
const clockFormats = {
  '24h': 'WOD6E.CHRONICLE.Clock24Hour',
  '12h': 'WOD6E.CHRONICLE.ClockAMPM'
}

let bar
let busy = false

function element(tag, options = {}) {
  return Object.assign(document.createElement(tag), options)
}

function selectFor(choices, value) {
  const select = element('select')

  for (const choice of choices) {
    select.add(
      element('option', {
        textContent: choice.label,
        value: choice.id,
        defaultSelected: choice.id === value
      })
    )
  }

  return select
}

function field(labelText, input) {
  const wrapper = element('label', { className: 'chronicle-field' })

  wrapper.append(element('span', { textContent: labelText }), input)

  return wrapper
}

function dialogOptions(title, content) {
  const wrapper = element('div')

  if (typeof content === 'string') wrapper.innerHTML = content
  else wrapper.append(content)

  return {
    window: { title: label(title) },
    classes: ['wod6e', 'chronicle-dialog'],
    modal: true,
    content: wrapper,
    rejectClose: false
  }
}

function updateBar() {
  if (!bar) return
  const select = bar.querySelector('select')
  const scopes = getScopes()
  const scope = scopes.find((entry) => entry.id === select?.value) ?? scopes[0]

  bar.querySelector('output').textContent = `${scope.label} (${scope.value}/10)`
  for (const pip of bar.querySelectorAll('[data-pip]')) {
    pip.classList.toggle('filled', Number(pip.dataset.pip) <= scope.value)
  }
  if (!select) return

  select.replaceChildren(
    ...scopes.map((entry) =>
      element('option', {
        textContent: `${entry.label} (${entry.value}/10)`,
        value: entry.id
      })
    )
  )
  select.value = scope.id
  select.title = scope.reference ? label(scope.reference.kind) : ''
  const readOnly = busy || !isChronicleStoryteller()

  for (const button of bar.querySelectorAll('button')) button.disabled = readOnly

  bar.querySelector('[data-action="clear"]').disabled ||= scope.value === 0
  bar.querySelector('[data-action="mark"]').disabled ||= scope.value === 10
}

function updateClock() {
  if (!bar) return
  const { calendar, components } = game.time
  const month = calendar.months?.values?.[components.month]
  const date = month
    ? `${game.i18n.localize(month.abbreviation || month.name)} ${components.dayOfMonth + 1}, ${components.year}`
    : label('OrdinalDate', { day: components.day + 1, year: components.year })
  const minute = String(components.minute).padStart(2, '0')
  const useAMPM =
    calendar.days.hoursPerDay === 24 && game.settings.get('wod6e', clockFormatSetting) === '12h'
  const time = useAMPM
    ? `${components.hour % 12 || 12}:${minute} ${label(components.hour < 12 ? 'AM' : 'PM')}`
    : `${String(components.hour).padStart(2, '0')}:${minute}`
  bar.querySelector('[data-clock]').textContent = `${date} · ${time}`
}

async function run(action) {
  if (busy || !isChronicleStoryteller()) return

  busy = true
  updateBar()

  try {
    return await action()
  } catch (error) {
    ui.notifications.error(error.message)
  } finally {
    busy = false
    updateBar()
  }
}

async function submit(action) {
  try {
    await action()
  } catch (error) {
    ui.notifications.error(error.message)
  }
}

async function configureScopes() {
  const content = element('div', { className: 'chronicle-scope-config' })
  const list = element('div', { className: 'chronicle-scope-list' })
  const add = element('button', {
    type: 'button',
    className: 'chronicle-add-location',
    textContent: label('AddLocation')
  })

  content.append(element('strong', { textContent: label('Chronicle') }), list, add)

  const addRow = (targetList, scope) => {
    const row = element('div', { className: 'chronicle-scope-row' })
    row.dataset.scopeId = scope.id

    const name = element('input', { type: 'text', defaultValue: scope.name, maxLength: 64 })
    name.setAttribute('title', label('LocationName'))

    const remove = element('button', {
      type: 'button',
      className: 'chronicle-remove-location',
      textContent: label('RemoveLocation')
    })

    row.append(name, remove)
    targetList.append(row)
    return name
  }

  for (const scope of getScopes().slice(1)) addRow(list, scope)

  await foundry.applications.api.DialogV2.confirm({
    ...dialogOptions('Scopes', content),
    render: (_event, dialog) => {
      const config = dialog.element.querySelector('.chronicle-scope-config')
      const liveList = config.querySelector('.chronicle-scope-list')
      config
        .querySelector('.chronicle-add-location')
        .addEventListener('click', () =>
          addRow(liveList, { id: foundry.utils.randomID(), name: '' }).focus()
        )
      liveList.addEventListener('click', (event) =>
        event.target
          .closest('.chronicle-remove-location')
          ?.closest('.chronicle-scope-row')
          ?.remove()
      )
    },
    yes: {
      label: label('Save'),
      callback: async (_event, button) => {
        const scopes = getScopes()
        const rows = [...button.form.querySelectorAll('.chronicle-scope-row')].flatMap((row) => {
          const name = row.querySelector('input').value.trim()
          const id = row.dataset.scopeId
          const existing = scopes.find((scope) => scope.id === id)
          return name ? [{ ...existing, id, name, value: existing?.value ?? 0 }] : []
        })
        await submit(() => saveScopes([scopes[0], ...rows]))
      }
    }
  })
}

async function configureTime() {
  const { calendar, components } = game.time
  const originalTime = game.time.worldTime
  const months = calendar.months?.values ?? []
  const content = await foundry.applications.handlebars.renderTemplate(
    'systems/wod6e/templates/core/dialogs/configure-world-time.hbs',
    {
      year: components.year,
      month: components.month,
      monthOptions: months.map((entry) => entry.name),
      day: (months.length ? components.dayOfMonth : components.day) + 1,
      hour: components.hour,
      minute: components.minute,
      maxHour: calendar.days.hoursPerDay - 1,
      maxMinute: calendar.days.minutesPerHour - 1,
      clockFormats: calendar.days.hoursPerDay === 24 ? clockFormats : null,
      clockFormat: game.settings.get('wod6e', clockFormatSetting)
    }
  )
  const advances = { minutes: { minute: 10 }, hour: { hour: 1 }, day: { day: 1 } }
  const read = ({ elements }) =>
    calendarDate(calendar, {
      year: elements.year.valueAsNumber,
      month: months.length ? Number(elements.month.value) : 0,
      day: elements.day.valueAsNumber,
      hour: elements.hour.valueAsNumber,
      minute: elements.minute.valueAsNumber,
      second: components.second
    })

  await foundry.applications.api.DialogV2.wait({
    ...dialogOptions('SetTime', content),
    buttons: [
      {
        action: 'set',
        label: label('Save'),
        default: true,
        callback: async (_event, button) => {
          const timestamp = read(button.form)
          if (timestamp === null || !isChronicleStoryteller()) return
          await submit(async () => {
            if (timestamp !== originalTime) await game.time.set(timestamp)
            const format = button.form.elements.clockFormat?.value
            if (
              Object.hasOwn(clockFormats, format) &&
              format !== game.settings.get('wod6e', clockFormatSetting)
            ) {
              await game.settings.set('wod6e', clockFormatSetting, format)
            }
          })
        }
      },
      { action: 'cancel', label: game.i18n.localize('WOD6E.Cancel') }
    ],
    render: (_event, dialog) => {
      const form = dialog.element.querySelector('form')
      const set = form.querySelector('[data-action="set"]')
      const validate = () => {
        set.disabled = read(form) === null
        set.title = set.disabled ? label('InvalidDate') : ''
      }
      form.addEventListener('input', validate)
      validate()
      const shortcuts = form.querySelectorAll('[data-time-advance]')
      for (const button of shortcuts) {
        const delta = advances[button.dataset.timeAdvance]
        button.addEventListener('click', async () => {
          if (!isChronicleStoryteller()) return
          for (const control of shortcuts) control.disabled = true
          try {
            await game.time.advance(delta)
            await dialog.close()
          } catch (error) {
            ui.notifications.error(error.message)
            for (const control of shortcuts) control.disabled = false
          }
        })
      }
    }
  })
}

async function endBoundary(boundary) {
  const entries = getExpiringConditions(boundary, game.scenes.current)
  const content = element('div', { className: 'chronicle-expiry' })
  content.append(
    element('p', { textContent: label(entries.length ? 'Expiring' : 'NothingExpires') })
  )
  if (entries.length) {
    const list = element('ul')
    for (const { actor, item } of entries) {
      list.append(element('li', { textContent: `${actor.name} - ${item.name}` }))
    }
    content.append(list)
  }
  await foundry.applications.api.DialogV2.confirm({
    ...dialogOptions(boundaryLabels[boundary], content),
    yes: {
      label: label(boundaryLabels[boundary]),
      callback: () => submit(() => expireConditions(boundary, entries))
    }
  })
}

async function reviewMasquerade(message, kind) {
  const scopes = getScopes()
  const sceneName = game.scenes.get(message.speaker.scene)?.name
  const preferred =
    scopes.find((scope) => scope.name === sceneName)?.id ?? bar?.querySelector('select').value

  const select = selectFor(scopes, preferred ?? scopes[0].id)
  select.name = 'scope'

  const content = element('div')
  content.append(element('p', { textContent: label(kind) }), field(label('Scope'), select))

  const actions = [
    ['mark', 1, 'Mark'],
    ['clear', -1, 'Clear']
  ]

  await foundry.applications.api.DialogV2.wait({
    ...dialogOptions('Review', content),
    buttons: [
      ...actions.map(([action, delta, key]) => ({
        action,
        label: label(key),
        callback: async (_event, button) => {
          const id = button.form.elements.scope.value
          await submit(async () => {
            await adjustMasquerade(id, delta, { kind, uuid: message.uuid })
            if (bar) bar.querySelector('select').value = id
          })
        }
      })),
      { action: 'cancel', label: game.i18n.localize('WOD6E.Cancel') }
    ]
  })
}

export function renderMasqueradeReference(message, html) {
  if (!game.user.isGM || !message.isContentVisible) return
  const kind = message.rolls?.some((roll) => roll.options?.beastsBargain?.accepted)
    ? 'Bargain'
    : message.getFlag('wod6e', 'masqueradeDowntime')
      ? 'Downtime'
      : null
  const content = html.querySelector('.message-content')
  if (!kind || !content || content.querySelector('.wod6e-masquerade-reference')) return
  const button = element('button', {
    type: 'button',
    className: 'wod6e-masquerade-reference',
    textContent: label('Review')
  })
  button.addEventListener('click', () => run(() => reviewMasquerade(message, kind)))
  content.append(button)
}

export function registerChronicleSettings() {
  game.settings.register('wod6e', clockFormatSetting, {
    scope: 'world',
    config: false,
    type: String,
    choices: clockFormats,
    default: '24h',
    onChange: updateClock
  })

  game.settings.register('wod6e', chronicleTimeInitialized, {
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  })

  game.settings.register('wod6e', chronicleSetting, {
    scope: 'world',
    config: false,
    type: Object,
    default: { scopes: defaultScopes },
    onChange: updateBar
  })
}

export async function mountChronicleBar() {
  if (bar?.isConnected) return

  const host = document.getElementById('ui-top')
  if (!host) return

  const template = element('template')
  template.innerHTML = await foundry.applications.handlebars.renderTemplate(
    'systems/wod6e/templates/core/chronicle-bar.hbs',
    {
      isGM: game.user.isGM,
      boundaries: boundaries.map((id) => ({
        id,
        label: label(boundaryLabels[id]),
        title: label(`${boundaryLabels[id]}Title`)
      })),
      pips: Array.from({ length: 10 }, (_, index) => index + 1)
    }
  )
  bar = template.content.firstElementChild
  host.prepend(bar)

  const select = bar.querySelector('select')
  if (select) {
    select.addEventListener('change', updateBar)
    bar.addEventListener('click', (event) => {
      const action = event.target.closest('button[data-action]')?.dataset.action
      if (!action) return
      void run(() => {
        if (action === 'scopes') return configureScopes()
        if (action === 'time') return configureTime()
        if (boundaries.includes(action)) return endBoundary(action)
        return adjustMasquerade(select.value, action === 'mark' ? 1 : -1)
      })
    })

    Hooks.on('userConnected', updateBar)
  }

  updateBar()
  updateClock()
  Hooks.on('updateWorldTime', updateClock)
}

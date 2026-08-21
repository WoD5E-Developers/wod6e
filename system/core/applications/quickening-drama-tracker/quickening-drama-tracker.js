const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

const QUICKENING_MAX = 5

export class QuickeningDramaTrackerApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'wod6e-quickening-drama-tracker',
    window: {
      icon: 'fa-solid fa-dice-d10',
      title: 'WOD6E.APPLICATIONS.QuickeningDramaTracker',
      resizable: false
    },
    classes: ['wod6e', 'application', 'quickening-drama-tracker'],
    position: {
      width: 260
    },
    actions: {
      increaseQuickening: QuickeningDramaTrackerApplication.#onIncreaseQuickening,
      decreaseQuickening: QuickeningDramaTrackerApplication.#onDecreaseQuickening,
      setQuickening: QuickeningDramaTrackerApplication.#onSetQuickening,
      increaseDrama: QuickeningDramaTrackerApplication.#onIncreaseDrama,
      decreaseDrama: QuickeningDramaTrackerApplication.#onDecreaseDrama,
      toggleQuickening: QuickeningDramaTrackerApplication.#onToggleQuickening,
      toggleDrama: QuickeningDramaTrackerApplication.#onToggleDrama
    }
  }

  _getHeaderControls() {
    const controls = super._getHeaderControls()
    const user = game.user

    const hasQuickening = Boolean(user.character)
    const hasDrama = user.isGM

    if (hasQuickening) {
      const quickeningHidden = Boolean(user.getFlag('wod6e', 'tracker.quickeningHidden'))

      controls.push({
        icon: quickeningHidden ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash',
        label: quickeningHidden
          ? 'WOD6E.APPLICATIONS.ShowQuickening'
          : 'WOD6E.APPLICATIONS.HideQuickening',
        action: 'toggleQuickening'
      })
    }

    if (hasDrama) {
      const dramaHidden = Boolean(user.getFlag('wod6e', 'tracker.dramaHidden'))

      controls.push({
        icon: dramaHidden ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash',
        label: dramaHidden ? 'WOD6E.APPLICATIONS.ShowDrama' : 'WOD6E.APPLICATIONS.HideDrama',
        action: 'toggleDrama'
      })
    }

    return controls
  }

  static PARTS = {
    body: {
      template: 'systems/wod6e/templates/core/applications/quickening-drama-tracker/body.hbs'
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    const user = game.user

    const quickening = Number(user.getFlag('wod6e', 'quickening') ?? 0)
    const drama = Number(user.getFlag('wod6e', 'drama') ?? 0)

    const quickeningHidden = Boolean(user.getFlag('wod6e', 'tracker.quickeningHidden'))

    const dramaHidden = Boolean(user.getFlag('wod6e', 'tracker.dramaHidden'))

    const hasAssignedActor = Boolean(user.character)
    const isStoryteller = user.isGM

    return foundry.utils.mergeObject(context, {
      user,

      hasAssignedActor,
      isStoryteller,

      hasQuickening: hasAssignedActor,
      hasDrama: isStoryteller,

      showQuickening: hasAssignedActor && !quickeningHidden,
      showDrama: isStoryteller && !dramaHidden,
      showNoCharacterSelectedText: !isStoryteller && !hasAssignedActor && !quickeningHidden,

      quickeningHidden,
      dramaHidden,

      quickening: {
        value: Math.clamp(quickening, 0, QUICKENING_MAX),
        max: QUICKENING_MAX
      },

      drama: {
        value: Math.max(0, drama)
      }
    })
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options)

    switch (partId) {
      case 'body':
        context.quickeningTracker = Array.from({ length: context.quickening.max }, (_, index) => ({
          value: index + 1,
          selected: index < context.quickening.value
        }))

        break
    }

    return context
  }

  // Restore any saved position of the tracker
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options)

    const savedPosition = game.settings.get('wod6e', 'quickeningDramaTrackerPosition')

    if (savedPosition?.left != null && savedPosition?.top != null) {
      this.setPosition({
        left: savedPosition.left,
        top: savedPosition.top
      })
    }
  }

  // Save updated position of the tracker
  _onPosition(position) {
    super._onPosition(position)

    game.settings.set('wod6e', 'quickeningDramaTrackerPosition', {
      left: position.left,
      top: position.top
    })
  }

  // Change the current user's Quickening value
  static async #changeQuickening(application, change) {
    const user = game.user
    const current = Number(user.getFlag('wod6e', 'quickening') ?? 0)

    const value = Math.clamp(current + change, 0, QUICKENING_MAX)

    if (value === current) return

    await user.setFlag('wod6e', 'quickening', value)
  }

  // Change the current user's Drama value
  static async #changeDrama(application, change) {
    const user = game.user
    const current = Number(user.getFlag('wod6e', 'drama') ?? 0)

    const value = Math.max(0, current + change)

    if (value === current) return

    await user.setFlag('wod6e', 'drama', value)
  }

  // Various increase/decrease setters
  static async #onIncreaseQuickening() {
    await QuickeningDramaTrackerApplication.#changeQuickening(this, 1)
  }

  static async #onDecreaseQuickening() {
    await QuickeningDramaTrackerApplication.#changeQuickening(this, -1)
  }

  static async #onSetQuickening(event, target) {
    const value = Number(target.dataset.value)

    if (!Number.isInteger(value)) return

    const current = Number(game.user.getFlag('wod6e', 'quickening') ?? 0)

    // Clicking the currently-selected final dot reduces the tracker by one.
    const newValue = current === value ? value - 1 : value

    await game.user.setFlag('wod6e', 'quickening', Math.clamp(newValue, 0, QUICKENING_MAX))
  }

  static async #onIncreaseDrama() {
    await QuickeningDramaTrackerApplication.#changeDrama(this, 1)
  }

  static async #onDecreaseDrama() {
    await QuickeningDramaTrackerApplication.#changeDrama(this, -1)
  }

  // Toggle whether quickening/drama appear
  static async #onToggleQuickening() {
    const user = game.user
    const hidden = Boolean(user.getFlag('wod6e', 'tracker.quickeningHidden'))

    await user.setFlag('wod6e', 'tracker.quickeningHidden', !hidden)
  }

  static async #onToggleDrama() {
    const user = game.user
    const hidden = Boolean(user.getFlag('wod6e', 'tracker.dramaHidden'))

    await user.setFlag('wod6e', 'tracker.dramaHidden', !hidden)
  }
}

Hooks.on('updateUser', (user) => {
  if (user.id !== game.user.id) return

  window.WOD6E.applications.quickeningDramaTracker.render()
})

Hooks.on('getSceneControlButtons', (controls) => {
  const tokenControls = controls.tokens
  if (!tokenControls?.tools) return

  tokenControls.tools['quickening-drama-tracker'] = {
    name: 'quickening-drama-tracker',
    title: 'WOD6E.APPLICATIONS.QuickeningDramaTracker',
    icon: 'fa-solid fa-user-pen',
    order: 100,
    button: true,
    onChange: () => {
      window.WOD6E.applications.quickeningDramaTracker.render({
        force: true
      })
    }
  }
})

Hooks.on('wod6e.adjustQuickening', async (user, amount) => {
  const current = Number(user.getFlag('wod6e', 'quickening') ?? 0)

  const value = Math.clamp(current + amount, 0, 5)

  if (value === current) return

  if (value > current) {
    // Addition
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: `
        <div class="wod6e chat-card">
          <h4 class="chat-card-name">${game.i18n.localize('WOD6E.CHAT.QuickeningGained')}</h4>
          <div class="chat-card-description">
            ${game.i18n.format('WOD6E.CHAT.UserHasGainedAmountQuickening', {
              user: user.name,
              amount
            })}
          </div>
        </div>
      `
    })
  } else {
    // Subtraction
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: `
      <div class="wod6e chat-card">
        <h4 class="chat-card-name">${game.i18n.localize('WOD6E.CHAT.QuickeningSpent')}</h4>
        <div class="chat-card-description">
          ${game.i18n.format('WOD6E.CHAT.UserHasSpentAmountQuickening', {
            user: user.name,
            amount: Math.abs(amount)
          })}
        </div>
      </div>
    `
    })
  }

  // Adjust quickening value on the user
  await user.setFlag('wod6e', 'quickening', value)
})

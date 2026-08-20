import { _onRoll } from '../actors/scripts/on-roll.js'

export class WoDChatLog extends foundry.applications.sidebar.tabs.ChatLog {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      rollItemTest: _onRoll
    }
  }
}

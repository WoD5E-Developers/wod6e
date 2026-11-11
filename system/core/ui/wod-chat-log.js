import { _onRoll } from '../actors/scripts/on-roll.js'
import { renderTestFollowupButtons } from '../scripts/test-followups.js'

export class WoDChatLog extends foundry.applications.sidebar.tabs.ChatLog {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      rollItemTest: _onRoll
    }
  }
}

Hooks.on('renderChatMessageHTML', renderTestFollowupButtons)

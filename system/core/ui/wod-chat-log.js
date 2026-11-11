import { _onRoll } from '../actors/scripts/on-roll.js'
import { renderTestFollowupButtons } from '../scripts/test-followups.js'
import { payItemCost, renderItemCostButton } from '../scripts/item-cost.js'

export class WoDChatLog extends foundry.applications.sidebar.tabs.ChatLog {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      rollItemTest: _onRoll,
      payItemCost
    }
  }
}

Hooks.on('renderChatMessageHTML', renderTestFollowupButtons)
Hooks.on('renderChatMessageHTML', renderItemCostButton)

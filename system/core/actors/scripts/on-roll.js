import { RollDialog } from '../../dialogs/roll-dialog.js'

export const _onRoll = function (event, target) {
  const actor = this.actor || null
  const item = this.item || null
  const attributes = target.getAttribute('data-attribute')?.split(',') ?? []
  const skills = target.getAttribute('data-skill')?.split(',') ?? []
  const disciplines = target.getAttribute('data-discipline')?.split(',') ?? []

  RollDialog.open({
    actor,
    item,
    test: {
      attributes,
      skills,
      disciplines
    }
  })
}

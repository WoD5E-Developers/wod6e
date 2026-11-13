import { RollDialog } from '../../../../../core/dialogs/roll-dialog.js'
import { hasBeast } from '../../../../../core/actors/scripts/vitae.js'
import { getFrenzyDifficulty, RAGE_MODIFIERS } from '../../../scripts/frenzy.js'

export async function _onResistFrenzy() {
  const actor = this.actor
  if (!actor.isOwner || !hasBeast(actor)) return
  const content = await foundry.applications.handlebars.renderTemplate(
    'systems/wod6e/templates/splats/vampire/dialogs/frenzy.hbs',
    {
      types: Object.fromEntries(
        ['hunger', 'fear', 'rage', 'clan'].map((type) => [type, `WOD6E.VAMPIRE.Frenzy_${type}`])
      ),
      rage: RAGE_MODIFIERS.map(([key, modifier], index) => ({
        index,
        label: `WOD6E.VAMPIRE.Rage_${key}`,
        modifier: modifier > 0 ? `+${modifier}` : modifier
      }))
    }
  )
  const read = (form) => ({
    type: form.elements.frenzyType.value,
    fear: Number(form.elements.fear.value),
    rage: [...form.querySelectorAll('[name="rage"]:checked')].map((input) => Number(input.value))
  })
  return foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('WOD6E.VAMPIRE.ResistFrenzy') },
    position: { width: 480 },
    content,
    render: (_event, dialog) => {
      const form = dialog.element.querySelector('form')
      const update = () => {
        const options = read(form)
        for (const section of form.querySelectorAll('[data-frenzy-section]'))
          section.hidden = section.dataset.frenzySection !== options.type
        form.querySelector('[data-frenzy-difficulty]').textContent = getFrenzyDifficulty(
          actor,
          options.type,
          options
        )
      }
      form.addEventListener('change', update)
      update()
    },
    buttons: [
      {
        action: 'resist',
        default: true,
        label: game.i18n.localize('WOD6E.ROLL.Roll'),
        callback: async (_event, button, dialog) => {
          const options = read(button.form)
          await dialog.close()
          return RollDialog.open({
            actor,
            test: {
              attributes: ['composure', 'resolve'],
              attributeMode: 'all',
              skills: [],
              disciplines: [],
              difficulty: getFrenzyDifficulty(actor, options.type, options),
              resistBeast: true,
              frenzyType: options.type,
              action: `resist-${options.type}-frenzy`
            }
          })
        }
      },
      {
        action: 'cancel',
        label: game.i18n.localize('WOD6E.Cancel')
      }
    ],
    rejectClose: false
  })
}

import { attachSkillEntryControls, readSkillEntries } from './skill-entry-controls.js'

export async function _onConfigureSkillFocuses(event) {
  event.preventDefault()
  if (!this.isEditable) return

  const actor = this.actor
  const traits = Object.entries(WOD6E.configs.Skills.getList({}))
    .filter(([, skill]) => !skill.hidden)
    .map(([key, skill]) => ({
      key,
      label: skill.displayName ?? game.i18n.localize(skill.label),
      active: true,
      specializations: actor.system.skills?.[key]?.focuses ?? []
    }))
  const removeEntryLabel = 'WOD6E.SKILLS.RemoveFocus'
  const content = document.createElement('div')
  content.innerHTML = await foundry.applications.handlebars.renderTemplate(
    'systems/wod6e/templates/core/dialogs/npc-trait-visibility.hbs',
    {
      traits,
      focusOnly: true,
      showSpecializations: true,
      addEntryLabel: 'WOD6E.SKILLS.AddFocus',
      removeEntryLabel
    }
  )

  const changes = await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.format('WOD6E.AddString', {
        string: game.i18n.localize('WOD6E.SKILLS.SkillFocuses')
      })
    },
    classes: ['wod6e', 'skill-entries-dialog', 'skill-focus-dialog'],
    position: { width: 500 },
    content,
    modal: true,
    buttons: [{ action: 'cancel', label: 'WOD6E.Cancel' }],
    render: (_event, dialog) => {
      attachSkillEntryControls(dialog.element.querySelector('.npc-trait-editor'), removeEntryLabel)
    },
    ok: {
      callback: (_event, button) => {
        const changes = {}
        for (const { key, specializations } of traits) {
          const focuses = readSkillEntries(button.form, key)
          if (
            focuses.length !== specializations.length ||
            focuses.some((focus, index) => focus !== specializations[index])
          ) {
            changes[`system.skills.${key}.focuses`] = focuses
          }
        }
        return changes
      }
    }
  })

  if (changes && changes !== 'cancel' && Object.keys(changes).length) await actor.update(changes)
}

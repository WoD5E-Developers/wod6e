import {
  attachSkillEntryControls,
  readSkillEntries,
  readSpecialization,
  splitSpecializations
} from './skill-entry-controls.js'
import { prepareNpcDisciplines, prepareNpcSkillPools } from './prepare-npc-partials.js'

export function _onConfigureNpcSkillPools() {
  if (!this.isEditable) return
  return configureNpcTraits(this.actor, {
    traits: prepareNpcSkillPools(this.actor),
    path: 'system.skillPools',
    title: 'WOD6E.NPC.ConfigureSkillPools',
    showSpecializations: true
  })
}

export function _onConfigureNpcDisciplines() {
  if (!this.isEditable) return
  return configureNpcTraits(this.actor, {
    traits: prepareNpcDisciplines(this.actor),
    path: 'system.disciplines',
    title: 'WOD6E.NPC.ConfigureDisciplines'
  })
}

const readCheckbox = (form, key) => form.elements.namedItem(`trait.${key}`)
function attachSkillPoolControls(element, traits) {
  const editor = element.querySelector('.npc-trait-editor')
  const count = editor.querySelector('.npc-trait-count')
  const form = count.closest('form')
  const updateSelection = () => {
    let selected = 0
    for (const { key } of traits) {
      const { checked } = readCheckbox(form, key)
      readSpecialization(form, key).closest('.npc-specialization-row').hidden = !checked
      if (checked) selected++
    }
    count.textContent = game.i18n.format('WOD6E.NPC.SkillPoolsSelected', {
      selected,
      total: traits.length
    })
  }

  editor.querySelector('.npc-trait-options').addEventListener('change', updateSelection)
  editor.querySelector('.npc-trait-bulk').addEventListener('click', (event) => {
    const button = event.target.closest('button')
    if (!button) return
    if (button.dataset.selectTraits) {
      for (const { key } of traits) {
        readCheckbox(form, key).checked = button.dataset.selectTraits === 'all'
      }
      updateSelection()
    }
  })
  attachSkillEntryControls(editor, 'WOD6E.NPC.RemoveSpecialization')
  updateSelection()
}

async function configureNpcTraits(actor, { traits, path, title, showSpecializations = false }) {
  const content = document.createElement('div')
  content.innerHTML = await foundry.applications.handlebars.renderTemplate(
    'systems/wod6e/templates/core/dialogs/npc-trait-visibility.hbs',
    {
      traits: showSpecializations
        ? traits.map((trait) => ({
            ...trait,
            specializations: splitSpecializations(trait.specialization)
          }))
        : traits,
      showSpecializations,
      addEntryLabel: 'WOD6E.NPC.AddSpecialization',
      removeEntryLabel: 'WOD6E.NPC.RemoveSpecialization'
    }
  )

  const changes = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize(title) },
    classes: [
      'wod6e',
      'npc-trait-dialog',
      ...(showSpecializations ? ['skill-entries-dialog'] : [])
    ],
    position: { width: showSpecializations ? 920 : 460 },
    content,
    modal: true,
    buttons: [{ action: 'cancel', label: 'WOD6E.Cancel' }],
    render: (_event, dialog) => {
      if (showSpecializations) attachSkillPoolControls(dialog.element, traits)
    },
    ok: {
      callback: (_event, button) => {
        const changes = {}
        for (const trait of traits) {
          const active = readCheckbox(button.form, trait.key).checked
          if (active !== trait.active) changes[`${path}.${trait.key}.active`] = active
          if (!showSpecializations || !active) continue

          const specialization = readSkillEntries(button.form, trait.key).join(', ')
          if (specialization !== splitSpecializations(trait.specialization).join(', ')) {
            changes[`${path}.${trait.key}.active`] = true
            changes[`${path}.${trait.key}.specialization`] = specialization
          }
        }
        return changes
      }
    }
  })

  if (changes && changes !== 'cancel' && Object.keys(changes).length) await actor.update(changes)
}

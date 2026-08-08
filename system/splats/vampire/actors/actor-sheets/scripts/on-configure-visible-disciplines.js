export const _onConfigureVisibleDisciplines = async function (event) {
  event.preventDefault()

  const actor = this.actor
  const actorDisciplines = actor.system.vampire.disciplines ?? {}

  // Prepare disciplines that can be configured
  const disciplines = Object.entries(WOD6E.configs.Disciplines.getList({}))
    .filter(([, discipline]) => !discipline.hidden)
    .map(([key, discipline]) => ({
      key,
      label: discipline.displayName,
      visible: actorDisciplines[key]?.visible ?? true
    }))

  // Build dialog content
  const options = disciplines
    .map(
      ({ key, label, visible }) => `
        <div class="flexrow discipline-pool">
          <label for="discipline-${key}">${label}</label>
          <input
            id="discipline-${key}"
            type="checkbox"
            class="discipline-checkbox"
            name="${key}"
            ${visible ? 'checked' : ''}
          >
        </div>
      `
    )
    .join('')

  const content = `
    <form>
      <div class="form-group power-visibility-list">
        ${options}
      </div>
    </form>
  `

  // Prompt the dialog
  const updatedDisciplines = await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.format('WOD6E.AddString', {
        string: game.i18n.localize('TYPES.Item.discipline')
      })
    },
    content,
    ok: {
      callback: (event, button) => {
        const formData = new foundry.applications.ux.FormDataExtended(button.form).object

        return Object.fromEntries(
          disciplines.map(({ key }) => [
            key,
            {
              visible: Boolean(formData[key])
            }
          ])
        )
      }
    },
    modal: true
  })

  if (!updatedDisciplines) return

  await actor.update({
    'system.vampire.disciplines': updatedDisciplines
  })
}

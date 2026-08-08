export const _onConfigureSkillFocuses = async function (event) {
  event.preventDefault()

  const actor = this.actor
  const actorSkills = actor.system.skills ?? {}

  // Prepare skills that can be configured
  const skills = Object.entries(WOD6E.configs.Skills.getList({}))
    .filter(([, skill]) => !skill.hidden)
    .map(([key, skill]) => ({
      key,
      label: skill.displayName,
      focuses: actorSkills[key]?.focuses ?? []
    }))

  // Build dialog content
  const options = skills
    .map(
      ({ key, label, focuses }) => `
      <div class="flexrow skill-pool">
        <label>${label}</label>
        <input
          type="text"
          name="${key}"
          value="${focuses.join(', ')}"
          placeholder="${game.i18n.localize('WOD6E.SKILLS.Focuses')}"
        />
      </div>
    `
    )
    .join('')

  const content = `
    <form>
      <div class="skill-configuration-label">
        ${game.i18n.localize('WOD6E.SKILLS.ConfigureSkillFocusesHint')}
      </div>
      <div class="form-group skill-configuration-list">
        ${options}
      </div>
    </form>
  `

  // Prompt the dialog
  const updatedSkills = await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.format('WOD6E.AddString', {
        string: game.i18n.localize('WOD6E.SKILLS.SkillFocuses')
      })
    },
    content,
    ok: {
      callback: (event, button) => {
        const formData = new foundry.applications.ux.FormDataExtended(button.form).object

        return Object.fromEntries(
          skills.map(({ key }) => [
            key,
            {
              focuses: String(formData[key] ?? '')
                .split(',')
                .map((focus) => focus.trim())
                .filter(Boolean)
            }
          ])
        )
      }
    },
    modal: true
  })

  if (!updatedSkills) return

  await actor.update({
    'system.skills': updatedSkills
  })
}

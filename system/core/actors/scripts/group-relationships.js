function escapeHtml(value) {
  const element = document.createElement('div')
  element.textContent = String(value ?? '')
  return element.innerHTML
}

async function openRelationshipDialog(actor, relationship = null) {
  const selectedMembers = new Set(relationship?.memberUuids ?? [])
  const memberOptions = (actor.system.members ?? [])
    .map((uuid) => fromUuidSync(uuid))
    .filter(Boolean)
    .map(
      (member) => `
        <label class="relationship-member-option">
          <input
            type="checkbox"
            name="memberUuids"
            value="${escapeHtml(member.uuid)}"
            ${selectedMembers.has(member.uuid) ? 'checked' : ''}
          />
          <span>${escapeHtml(member.name)}</span>
        </label>
      `
    )
    .join('')

  const content = `
    <form class="relationship-dialog-form">
      <div class="form-group">
        <label>${game.i18n.localize('WOD6E.GROUPS.RelationshipName')}</label>
        <input
          type="text"
          name="name"
          value="${escapeHtml(relationship?.name ?? '')}"
          required
        />
      </div>
      <fieldset class="relationship-member-options">
        <legend>${game.i18n.localize('WOD6E.GROUPS.ConnectedMembers')}</legend>
        ${memberOptions}
      </fieldset>
      <div class="form-group stacked">
        <label>${game.i18n.localize('WOD6E.Description')}</label>
        <textarea name="description" rows="8">${escapeHtml(relationship?.description ?? '')}</textarea>
      </div>
    </form>
  `

  return foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.localize(
        relationship ? 'WOD6E.GROUPS.EditRelationship' : 'WOD6E.GROUPS.AddRelationship'
      )
    },
    position: {
      width: 520
    },
    content,
    ok: {
      callback: (event, button) => {
        const formData = new foundry.applications.ux.FormDataExtended(button.form).object
        const memberUuids = Array.from(
          button.form.querySelectorAll('input[name="memberUuids"]:checked'),
          (input) => input.value
        )

        if (memberUuids.length < 2) {
          ui.notifications.warn(game.i18n.localize('WOD6E.GROUPS.RelationshipNeedsMembers'))
          return false
        }

        return {
          id: relationship?.id ?? foundry.utils.randomID(8),
          name: String(formData.name ?? '').trim(),
          memberUuids,
          description: String(formData.description ?? '')
        }
      }
    },
    modal: true
  })
}

export async function createRelationship(event) {
  event.preventDefault()
  if (!this.actor.isOwner) return false

  const relationship = await openRelationshipDialog(this.actor)
  if (!relationship) return false

  const relationships = this.actor.toObject().system.relationships ?? []
  relationships.push(relationship)

  await this.actor.update({ 'system.relationships': relationships })
  return true
}

export async function editRelationship(event, target) {
  event.preventDefault()
  event.stopPropagation()
  if (!this.actor.isOwner) return false

  const relationships = this.actor.toObject().system.relationships ?? []
  const index = relationships.findIndex(
    (relationship) => relationship.id === target.dataset.relationshipId
  )
  if (index < 0) return false

  const updatedRelationship = await openRelationshipDialog(this.actor, relationships[index])
  if (!updatedRelationship) return false

  relationships[index] = updatedRelationship
  await this.actor.update({ 'system.relationships': relationships })
  return true
}

export async function deleteRelationship(event, target) {
  event.preventDefault()
  event.stopPropagation()
  if (!this.actor.isOwner) return false

  const relationshipId = target.dataset.relationshipId
  const relationships = (this.actor.toObject().system.relationships ?? []).filter(
    (relationship) => relationship.id !== relationshipId
  )

  await this.actor.update({ 'system.relationships': relationships })
  return true
}

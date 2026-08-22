import { generationDetailLookup } from '../../../scripts/generation-detail-lookup.js'

export const _onBloodSurge = async function (event) {
  event.preventDefault()

  // If there is no actor or the actor can't blood surge, do nothing
  const actor = this.actor
  if (!actor.isOwner || !actor.system.canBloodSurge) return

  // If the user doesn't have any vitae, warn the user
  const availableVitae = actor.system.health?.value ?? 0
  if (availableVitae < 1) {
    ui.notifications.warn('WOD6E.VAMPIRE.BloodSurgeNoVitae')
    return
  }

  // If there are no valid attributes/disciplines, warn the user
  // This usually happens if their values are already at their
  // effective max
  const targets = getSurgeTargets(actor)
  const targetList = [...targets.attributes, ...targets.disciplines]
  if (targetList.length === 0) {
    ui.notifications.warn('WOD6E.VAMPIRE.BloodSurgeNoTargets')
    return
  }

  // Generate the selection dialog
  const content = `
    <div class="form-group">
      <label>${game.i18n.localize('WOD6E.VAMPIRE.BloodSurgeTrait')}</label>
      <select name="target" required>
        ${createTargetOptions(targets)}
      </select>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize('WOD6E.VAMPIRE.VitaeToSpend')}</label>
      <input type="number" name="vitae" value="1" min="1" max="${availableVitae}" step="1" required>
      <p class="hint">${game.i18n.localize('WOD6E.VAMPIRE.BloodSurgeCostHint')}</p>
    </div>
  `

  const result = await foundry.applications.api.DialogV2.input({
    window: {
      title: game.i18n.localize('WOD6E.VAMPIRE.BloodSurge')
    },
    classes: ['wod6e', 'dialog', 'blood-surge-dialog'],
    content,
    ok: {
      icon: 'fa-solid fa-droplet',
      label: game.i18n.localize('WOD6E.VAMPIRE.BloodSurge')
    },
    buttons: [
      {
        action: 'cancel',
        icon: 'fas fa-times',
        label: game.i18n.localize('WOD6E.Cancel'),
        type: 'button'
      }
    ],
    modal: true
  })

  if (!result || result === 'cancel') return

  // We consider a blood surge as invalid if:
  // 1. There is no target (invalid attribute/discipline)
  // 2. Vitae spent is below 1 or not a number
  // 3. The vitae spent would reduce the actor below 0 vitae
  const currentTargets = getSurgeTargets(actor)
  const currentTargetList = [...currentTargets.attributes, ...currentTargets.disciplines]
  const target = currentTargetList.find((entry) => `${entry.type}:${entry.key}` === result.target)
  const vitae = Number(result.vitae)
  const currentVitae = actor.system.health?.value ?? 0
  if (!target || !Number.isInteger(vitae) || vitae < 1 || vitae > currentVitae) {
    ui.notifications.warn('WOD6E.VAMPIRE.BloodSurgeInvalidSelection')
    return
  }

  // Check that the Vitae is in multiples of 2
  if (vitae % target.vitaePerDot !== 0) {
    ui.notifications.warn('WOD6E.VAMPIRE.BloodSurgeDisciplineCost')
    return
  }

  // Warn about going over the trait's maximum value
  const bonus = vitae / target.vitaePerDot
  const currentTrait = foundry.utils.getProperty(actor, target.path)
  if (!currentTrait || currentTrait.effective + bonus > target.max) {
    ui.notifications.warn('WOD6E.VAMPIRE.BloodSurgeMaximum', { maximum: target.max })
    return
  }

  await actor.update({ 'system.health.value': currentVitae - vitae })
  try {
    await actor.createEmbeddedDocuments('Item', [
      {
        name: game.i18n.format('WOD6E.VAMPIRE.BloodSurgeCondition', {
          trait: target.label
        }),
        type: 'condition',
        img: 'systems/wod6e/assets/actors/VampireSymbol.webp',
        system: {
          description: game.i18n.format('WOD6E.VAMPIRE.BloodSurgeDescription', {
            bonus,
            trait: target.label,
            vitae
          }),
          condition: {
            duration: 'scene'
          },
          effects: [
            {
              type: 'actorTrait',
              targets: [target.path],
              mode: 'add',
              value: bonus,
              valueSource: 'flat'
            }
          ]
        },
        flags: {
          wod6e: {
            bloodSurge: {
              targetType: target.type,
              target: target.key,
              vitae,
              bonus
            }
          }
        }
      }
    ])
  } catch (error) {
    await actor.update({ 'system.health.value': currentVitae })
    throw error
  }
}

function getExistingAttributeSurgeBonus(actor, key) {
  return actor.items
    .filter((item) => item.type === 'condition')
    .map((item) => item.flags?.wod6e?.bloodSurge)
    .filter((surge) => surge?.targetType === 'attribute' && surge.target === key)
    .reduce((total, surge) => total + (Number(surge.bonus) || 0), 0)
}

function getSurgeTargets(actor) {
  const generation = actor.system.vampire?.generation?.value
  const maximumValues = generationDetailLookup(generation)?.maximumValues
  if (!maximumValues) return { attributes: [], disciplines: [] }
  const bloodSurgeMaximum = Number(maximumValues.bloodSurge)

  const clan = actor.items.find((item) => item.type === 'clan')
  const inClanDisciplines = new Set(clan?.system?.disciplines ?? [])

  const attributes = Object.entries(WOD6E.configs.Attributes.getList({})).flatMap(
    ([key, definition]) => {
      const trait = actor.system.attributes?.[key]
      const existingBonus = getExistingAttributeSurgeBonus(actor, key)
      const remainingBonus = bloodSurgeMaximum - existingBonus
      if (!trait || !Number.isFinite(remainingBonus) || remainingBonus < 1) return []

      return [
        {
          type: 'attribute',
          key,
          path: `system.attributes.${key}`,
          label: definition.displayName,
          effective: trait.effective,
          max: trait.effective + remainingBonus,
          vitaePerDot: 1
        }
      ]
    }
  )

  const disciplines = Object.entries(WOD6E.configs.Disciplines.getList({})).flatMap(
    ([key, definition]) => {
      const trait = actor.system.vampire?.disciplines?.[key]
      const clanStatus = inClanDisciplines.has(key) ? 'inClan' : 'nonClan'
      const maximum = Number(maximumValues.disciplines?.[clanStatus])
      if (!trait || !Number.isFinite(maximum) || trait.effective >= maximum || !trait?.visible)
        return []

      return [
        {
          type: 'discipline',
          key,
          path: `system.vampire.disciplines.${key}`,
          label: definition.displayName,
          effective: trait.effective,
          max: maximum,
          vitaePerDot: 2
        }
      ]
    }
  )

  return { attributes, disciplines }
}

function createTargetOptions(targets) {
  const createOptions = (entries) =>
    entries
      .map(
        (target) =>
          `<option value="${target.type}:${target.key}">${target.label} (${target.effective}/${target.max})</option>`
      )
      .join('')

  return `
    <optgroup label="${game.i18n.localize('WOD6E.ATTRIBUTES.Attributes')}">
      ${createOptions(targets.attributes)}
    </optgroup>
    <optgroup label="${game.i18n.localize('WOD6E.VAMPIRE.Disciplines')}">
      ${createOptions(targets.disciplines)}
    </optgroup>
  `
}

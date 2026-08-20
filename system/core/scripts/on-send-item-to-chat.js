import { prepareConditionEffectsContext } from '../items/scripts/prepare-condition-partials.js'
import { generateTestTextFromItem } from '../items/scripts/generate-test-text-from-item.js'

function definitionLabel(config, key, fallback = key) {
  return config?.getList?.({})?.[key]?.displayName ?? fallback ?? game.i18n.localize('WOD6E.None')
}

function selectedLabels(config, selected = []) {
  return Array.from(selected, (key) => definitionLabel(config, key)).join(', ')
}

function traitLabel(path) {
  for (const config of [
    WOD6E.configs.Attributes,
    WOD6E.configs.Skills,
    WOD6E.configs.Disciplines
  ]) {
    const definition = config.getList({ usePath: true })[path]
    if (definition) return definition.displayName
  }
  return path
}

async function enrich(value, item) {
  if (!value) return ''
  return foundry.applications.ux.TextEditor.implementation.enrichHTML(value, {
    async: true,
    secrets: item.isOwner,
    relativeTo: item
  })
}

export async function resolveActorName(uuid) {
  if (!uuid) return ''

  const document = fromUuidSync(uuid)
  return document?.actor?.name ?? document?.name ?? ''
}

async function preparePrerequisites(prerequisites = {}) {
  const clan = prerequisites.clanUuid ? await globalThis.fromUuid(prerequisites.clanUuid) : null
  const requirements = (prerequisites.disciplineRequirements ?? []).map((requirement) => ({
    options: (requirement.options ?? []).map((option) => ({
      name: definitionLabel(WOD6E.configs.Disciplines, option.discipline),
      dots: option.dots
    }))
  }))
  return {
    clan: clan?.name ?? prerequisites.clanUuid ?? '',
    generationTier: prerequisites.generationTier ?? '',
    requirements,
    hasRequirements: Boolean(
      clan || prerequisites.clanUuid || prerequisites.generationTier || requirements.length
    )
  }
}

async function prepareChatContext(item) {
  const system = item.system
  const actor = item.actor
  const canRoll = Boolean(system.test && actor && (game.user.isGM || actor.isOwner))
  const difficultyDefinition = WOD6E.configs.Difficulties.getList({})[system.difficulty?.type]
  const conditionContext = {}
  let conditionSourceName = ''
  let conditionTargetName = ''
  if (item.type === 'condition') {
    await prepareConditionEffectsContext(conditionContext, item)
    const actorNames = await Promise.all([
      resolveActorName(system.condition?.sourceUuid),
      resolveActorName(system.condition?.targetUuid)
    ])
    conditionSourceName = actorNames[0]
    conditionTargetName = actorNames[1]
  }

  const actionTypes = {
    untyped: { displayName: game.i18n.localize('WOD6E.ACTIONS.Untyped') },
    ...WOD6E.configs.AttributeGroups.getList({})
  }

  return {
    item: { name: item.name, type: item.type, uuid: item.uuid, img: item.img },
    system,
    description: await enrich(system.description, item),
    source: system.source,
    hasSource: Boolean(system.source?.book),
    conditionSourceName,
    conditionTargetName,
    canRoll,
    test:
      system.test?.attributes?.size + system.test?.skills?.size + system.test?.disciplines?.size > 0
        ? {
            text: generateTestTextFromItem(item),
            description: system.test.description,
            attributes: selectedLabels(WOD6E.configs.Attributes, system.test.attributes),
            skills: selectedLabels(WOD6E.configs.Skills, system.test.skills),
            disciplines: selectedLabels(WOD6E.configs.Disciplines, system.test.disciplines)
          }
        : null,
    activation:
      system?.activation && system?.activation?.activationType !== 'none'
        ? {
            ...system.activation,
            typeLabel: definitionLabel(WOD6E.configs.Activations, system.activation.activationType),
            showDistance: system?.activation?.distance !== 'none',
            distanceLabel: definitionLabel(WOD6E.configs.Distances, system.activation.distance),
            showDuration: system?.activation?.duration !== 'none',
            durationLabel: definitionLabel(WOD6E.configs.Durations, system.activation.duration),
            costLabel: definitionLabel(WOD6E.configs.CostTypes, system.activation.cost?.type),
            damageResourceLabel: definitionLabel(
              WOD6E.configs.ResourceTypes,
              system.activation.damage?.resource
            )
          }
        : null,
    difficulty:
      system?.difficulty && system?.difficulty?.type !== 'none'
        ? {
            ...system.difficulty,
            label: difficultyDefinition?.displayName ?? system.difficulty.type,
            targetsTrait: traitLabel(system.difficulty.targetsTrait),
            attributes: selectedLabels(
              WOD6E.configs.Attributes,
              system.difficulty.multipleAttributes
            ),
            singleAttribute: definitionLabel(
              WOD6E.configs.Attributes,
              system.difficulty.singleAttribute
            ),
            usesFixedValue: difficultyDefinition?.usesFixedValue,
            usesTargetsTrait: difficultyDefinition?.usesTargetsTrait,
            usesAttribute: difficultyDefinition?.usesAttribute,
            usesMultipleAttributes: difficultyDefinition?.multipleAttributes,
            usesNpcLevel: difficultyDefinition?.usesNpcLevel,
            determinedByStoryteller: difficultyDefinition?.determinedByStoryteller,
            description: await enrich(system.difficulty.description, item)
          }
        : null,
    prerequisites: system.prerequisites ? await preparePrerequisites(system.prerequisites) : null,
    labels: {
      actionGroup: definitionLabel(WOD6E.configs.ActionGroups, system.group),
      actionRole: definitionLabel(WOD6E.configs.ActionRoles, system.role),
      actionType: actionTypes[system.actionType]?.displayName ?? system.actionType,
      resourceType: definitionLabel(WOD6E.configs.ResourceTypes, system.resourceType),
      disciplineType: definitionLabel(WOD6E.configs.Disciplines, system.disciplineType),
      disciplines: selectedLabels(WOD6E.configs.Disciplines, system.disciplines),
      conditionDuration: definitionLabel(WOD6E.configs.Durations, system.condition?.duration),
      attribute: definitionLabel(WOD6E.configs.AttributeGroups, system.attribute)
    },
    enriched: {
      indulging: await enrich(system.indulging, item),
      outburst: await enrich(system.outburst?.description, item),
      beast: await enrich(system.beast?.description, item),
      curse: await enrich(system.curse?.description, item),
      frenzy: await enrich(system.frenzy?.description, item),
      maturing: await Promise.all(
        (system.maturing ?? []).map(async (entry) => ({
          level: entry.level,
          description: await enrich(entry.description, item)
        }))
      )
    },
    effects: (conditionContext.effects ?? []).map((effect) => ({
      ...effect,
      value: effect.resolvedValue,
      typeLabel: definitionLabel(WOD6E.configs.EffectTypes, effect.type),
      modeLabel: game.i18n.localize(
        { add: 'WOD6E.Add', subtract: 'WOD6E.Subtract', override: 'WOD6E.Override' }[effect.mode] ??
          effect.mode
      )
    }))
  }
}

export const _onSendItemToChat = async function (event, target) {
  event?.preventDefault()

  const uuid = target?.dataset?.uuid
  if (!uuid) return

  const item = await globalThis.fromUuid(uuid)

  if (!item) return console.warn(`No item found with UUID "${uuid}"`)

  const itemType = WOD6E.configs.ItemTypes.getList({})[item.type]
  // Use either the chat template on the item type or a generic one
  const chatTemplate = itemType?.chatTemplate ?? 'systems/wod6e/templates/core/chat/base.hbs'
  const context = await prepareChatContext(item)
  const content = await foundry.applications.handlebars.renderTemplate(chatTemplate, context)

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({
      actor: item.actor
    }),
    content
  })
}

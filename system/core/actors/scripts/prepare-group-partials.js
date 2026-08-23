import { prepareMultiSelect } from '../../fields/multiselect.js'
import { generateTrackers } from './generate-trackers.js'
import { resolveGroupMembers } from './group-members.js'

function definitionOptions(definitions) {
  return Object.entries(definitions).map(([key, definition]) => ({
    key,
    label: definition.displayName ?? definition.label
  }))
}

export async function prepareGroupOverviewContext(context, actor) {
  context.tab = context.tabs.main

  context.subtypeOptions = definitionOptions(WOD6E.configs.GroupTypes.getList({}))
  context.subtypeSelected = actor?.system?.subtype

  context.coterieTypeOptions = definitionOptions(WOD6E.configs.CoterieTypes.getList({}))
  context.coterieTypeSelected = actor?.system?.coterieType
  context.showCoterieFields = actor?.system?.subtype === 'coterie'
  context.showCustomCoterieType = actor?.system?.coterieType === 'custom'
  context.customCoterieType = actor?.system?.customCoterieType ?? ''

  context.goals = {
    value: actor?.system?.goals,
    enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      actor?.system?.goals ?? ''
    )
  }
  context.domain = {
    value: actor?.system?.domain,
    enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      actor?.system?.domain ?? ''
    )
  }

  return context
}

export async function prepareGroupMembersContext(context, actor) {
  context.tab = context.tabs.members

  context.groupMembers = await resolveGroupMembers(actor)

  return context
}

export async function prepareGroupRelationshipsContext(context, actor) {
  const members = await resolveGroupMembers(actor)
  const memberOptions = members
    .filter((member) => member.exists)
    .map((member) => ({
      key: member.uuid,
      label: member.name
    }))

  context.relationships = []

  for (const [index, relationship] of Array.from(actor.system.relationships ?? []).entries()) {
    const memberUuids = Array.from(relationship.memberUuids ?? [])
    context.relationships.push({
      id: relationship.id,
      index,
      name: relationship.name,
      description: {
        value: relationship.description,
        enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          relationship?.description ?? ''
        )
      },
      members: prepareMultiSelect(memberUuids, memberOptions),
      isValid: memberUuids.length >= 2,
      missingMemberUuids: memberUuids.filter(
        (uuid) => !members.some((member) => member.uuid === uuid && member.exists)
      )
    })
  }

  return context
}

export async function prepareGroupResourcesContext(context, actor) {
  context.tab = context.tabs.resources

  const members = await resolveGroupMembers(actor)
  context.contributorOptions = members.filter((member) => member.exists)
  context.resources = actor.items
    .filter((item) => item.type === 'resource')
    .sort((a, b) => a.sort - b.sort)
    .map((item) => {
      const value = item.system.dots?.value ?? 0
      const max = item.system.dots?.max ?? 5

      const contributorUuid = item.system.contributedByUuid ?? ''
      const contributor = members.find((member) => member.uuid === contributorUuid)

      return {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        contributorUuid,
        contributor,
        contributorExists: !contributorUuid || Boolean(contributor?.exists),
        trackers: generateTrackers({
          name: item.name,
          value,
          max,
          groupSize: 5
        })
      }
    })

  return context
}

export async function prepareGroupSettingsContext(context, actor) {
  context.tab = context.tabs.settings

  context.settings = actor.system.settings ?? {}
  context.limitedSettingFields = [
    ['goals', 'WOD6E.GROUPS.Goals'],
    ['domain', 'WOD6E.GROUPS.Domain'],
    ['members', 'WOD6E.GROUPS.Members'],
    ['relationships', 'WOD6E.GROUPS.Relationships'],
    ['pooledResources', 'WOD6E.GROUPS.PooledResources']
  ].map(([path, label]) => ({
    path,
    label,
    checked: actor.system.settings?.limited?.[path] ?? false
  }))

  return context
}

export async function prepareGroupLimitedContext(context, actor) {
  const visibility = actor.system.settings?.limited ?? {}
  context.showGoals = visibility.goals
  context.showDomain = visibility.domain
  context.showMembers = visibility.members
  context.showRelationships = visibility.relationships
  context.showPooledResources = visibility.pooledResources
  context.goals = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actor.system.goals
  )
  context.domain = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    actor.system.domain
  )

  const members = await resolveGroupMembers(actor)
  context.members = visibility.members ? members : []

  context.relationships = []
  if (visibility.relationships) {
    for (const relationship of actor.system.relationships ?? []) {
      const relationshipMembers = Array.from(relationship.memberUuids ?? [])
        .map((uuid) => members.find((member) => member.uuid === uuid)?.name)
        .filter(Boolean)
      context.relationships.push({
        name: relationship.name,
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          relationship.description
        ),
        membersText: relationshipMembers.join(', ')
      })
    }
  }

  context.resources = visibility.pooledResources
    ? actor.items
        .filter((item) => item.type === 'resource')
        .sort((a, b) => a.sort - b.sort)
        .map((item) => ({
          name: item.name,
          value: item.system.dots?.value ?? 0,
          contributor: members.find((member) => member.uuid === item.system.contributedByUuid)?.name
        }))
    : []

  return context
}

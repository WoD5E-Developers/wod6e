export const obsoleteItemsSetting = 'alpha2ObsoleteItemsRemoved'

const feedTheBeastId = 'dIeB0hY7eSS5nH3E'
const connectWithHumanityId = 'XRRBp2HyscFZosuP'

function matchesAction(item, dataItemId, id) {
  const source = `Compendium.wod6e.actions.Item.${id}`
  return (
    item.flags?.wod6e?.dataItemId === dataItemId ||
    item._id === id ||
    item._stats?.compendiumSource === source ||
    item.flags?.core?.sourceId === source
  )
}

function isObsoleteItem(item) {
  if (item.type === 'nature') return true
  if (item.type !== 'action') return false
  if (matchesAction(item, 'action-feed-the-beast', feedTheBeastId)) return true
  // Follow Your Precepts reuses the old ID. Match the original text as well.
  return (
    matchesAction(item, 'action-connect-with-your-humanity', connectWithHumanityId) &&
    item.system?.description ===
      '<p>Engage with your Nature to reduce marks on your Nature tracker.</p>'
  )
}

function obsoleteIds(items) {
  return items.filter(isObsoleteItem).map((item) => item._id)
}

function embeddedRemovals(document) {
  // Source data still includes items whose type is no longer registered in Foundry.
  const ids = obsoleteIds(document.toObject().items)
  return ids.length ? [{ document, ids }] : []
}

function sceneRemovals(scene) {
  // Token deltas may own items independently of the base actor.
  return scene.tokens.contents.flatMap((token) =>
    token.delta ? embeddedRemovals(token.delta) : []
  )
}

async function removeEmbeddedItems(removals) {
  for (const { document, ids } of removals) {
    await document.deleteEmbeddedDocuments('Item', ids)
    if (document.toObject().items.some((item) => ids.includes(item._id) && !item._tombstone)) {
      throw new Error(`Could not remove retired items from ${document.uuid}`)
    }
  }
}

async function cleanCompendium(pack) {
  let ids = []
  let removals = []
  if (pack.documentName === 'Item') {
    const index = await pack.getIndex({
      fields: [
        'type',
        'flags.wod6e.dataItemId',
        'flags.core.sourceId',
        '_stats.compendiumSource',
        'system.description'
      ]
    })
    ids = obsoleteIds(index.contents)
  } else if (pack.documentName === 'Actor') {
    removals = (await pack.getDocuments()).flatMap(embeddedRemovals)
  } else if (pack.documentName === 'Scene') {
    removals = (await pack.getDocuments()).flatMap(sceneRemovals)
  }
  if (!ids.length && !removals.length) return

  const wasLocked = pack.locked
  const lockOverride = pack.config.locked
  if (wasLocked) await pack.configure({ locked: false })
  try {
    if (ids.length) {
      await Item.deleteDocuments(ids, { pack: pack.collection })
      if ((await pack.getDocuments({ _id__in: ids })).length) {
        throw new Error(`Could not remove retired items from ${pack.collection}`)
      }
      // Foundry may leave deleted invalid documents in the cached index.
      for (const id of ids) pack.index.delete(id)
    }
    await removeEmbeddedItems(removals)
  } finally {
    if (wasLocked) await pack.configure({ locked: lockOverride })
  }
}

export async function removeObsoleteItems() {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) return
  if (game.settings.get('wod6e', obsoleteItemsSetting)) return

  const items = game.items.contents.concat(
    Array.from(game.items.invalidDocumentIds, (id) => game.items.getInvalid(id))
  )
  const ids = obsoleteIds(items.map((item) => item.toObject()))
  if (ids.length) {
    await Item.deleteDocuments(ids)
    if (ids.some((id) => game.items.has(id) || game.items.invalidDocumentIds.has(id))) {
      throw new Error('Could not remove retired items from the world')
    }
  }

  await removeEmbeddedItems(game.scenes.contents.flatMap(sceneRemovals))
  await removeEmbeddedItems(game.actors.contents.flatMap(embeddedRemovals))

  for (const pack of game.packs) {
    const { packageType, packageName } = pack.metadata
    if (packageType === 'world' || (packageType === 'system' && packageName === 'wod6e')) {
      await cleanCompendium(pack)
    }
  }

  await game.settings.set('wod6e', obsoleteItemsSetting, true)
}

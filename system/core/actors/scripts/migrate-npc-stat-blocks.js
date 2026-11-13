export async function migrateNpcStatBlocks() {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) return

  const { ForcedDeletion } = foundry.data.operators
  const persist = (actor) => {
    const { tier, minion, creatureKind, attributePools, health, willpower, legacyNpc } =
      actor.toObject().system
    return actor.update(
      {
        system: {
          tier,
          minion,
          creatureKind,
          attributePools,
          health,
          willpower,
          legacyNpc,
          level: new ForcedDeletion(),
          defeated: new ForcedDeletion()
        },
        'flags.wod6e.npcStatBlockMigrated': true
      },
      { diff: false }
    )
  }

  // Persist token overrides first, before replacing the base Actor's legacy data.
  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      const actor = token.actor
      const delta = token.delta?.toObject().system
      if (
        !token.actorLink &&
        actor?.type === 'npc' &&
        actor.system.legacyNpc &&
        delta &&
        ['tier', 'level', 'defeated'].some((key) => Object.hasOwn(delta, key)) &&
        !token.delta.getFlag('wod6e', 'npcStatBlockMigrated')
      ) {
        await persist(actor)
      }
    }
  }

  for (const actor of game.actors) {
    if (
      actor.type === 'npc' &&
      actor.system.legacyNpc &&
      !actor.getFlag('wod6e', 'npcStatBlockMigrated')
    ) {
      await persist(actor)
    }
  }
}

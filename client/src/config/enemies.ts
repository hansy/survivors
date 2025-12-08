/**
 * Enemy stats. Each entry defines how a monster behaves and rewards the team.
 */
export type EnemyDefinition = {
  id: string;
  displayName: string;
  /** Designer-facing description of how it behaves. */
  description: string;
  /** Max health points. Typical range: 10-200. */
  maxHp: number;
  /** Damage dealt to players on contact. Typical range: 5-30. */
  contactDamage: number;
  /** Movement speed in pixels/second. Faster enemies reach players sooner. Typical: 40-200. */
  moveSpeed: number;
  /** How likely this enemy is chosen when spawning. Higher = more common. */
  spawnWeight: number;
  /** Experience or score granted when killed. Typical: 1-10. */
  xpValue: number;
  /** Color key used for placeholder sprite tint. */
  color: number;
};

export const enemies: EnemyDefinition[] = [
  {
    id: "zombie",
    displayName: "Shambler",
    description: "Slow, steady chaser. Bread-and-butter enemy.",
    maxHp: 30,
    contactDamage: 8,
    moveSpeed: 70,
    spawnWeight: 6,
    xpValue: 2,
    color: 0x4caf50
  },
  {
    id: "runner",
    displayName: "Runner",
    description: "Fast but fragile. Keeps pressure on kite paths.",
    maxHp: 18,
    contactDamage: 6,
    moveSpeed: 150,
    spawnWeight: 3,
    xpValue: 2,
    color: 0xff9800
  },
  {
    id: "brute",
    displayName: "Brute",
    description: "Tank that soaks hits. Slow but dangerous on contact.",
    maxHp: 90,
    contactDamage: 16,
    moveSpeed: 55,
    spawnWeight: 1,
    xpValue: 6,
    color: 0x9c27b0
  }
];

export function getEnemyById(id: string): EnemyDefinition {
  const def = enemies.find((e) => e.id === id);
  if (!def) {
    throw new Error(`Enemy id ${id} not found in config.`);
  }
  return def;
}

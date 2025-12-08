/**
 * Player balance knobs. Adjust these to tune survivability and feel.
 */
export type PlayerConfig = {
  /** Display name used in UI. */
  name: string;
  /** Max health points. Higher = tougher. Typical range: 50-200. */
  maxHp: number;
  /** Movement speed in pixels/second. Typical range: 120-260. */
  moveSpeed: number;
  /** Base damage per projectile. Typical range: 4-20. */
  baseDamage: number;
  /** Seconds between automatic attacks. Lower = faster shooting. Typical: 0.4-1.2. */
  attackCooldown: number;
  /** Starting weapon id from weapons.ts. */
  weaponId: string;
  /** Short note for designers. */
  description: string;
};

export const playerConfig: PlayerConfig = {
  name: "Ranger",
  maxHp: 120,
  moveSpeed: 200,
  baseDamage: 8,
  attackCooldown: 0.75,
  weaponId: "straightShot",
  description: "Balanced runner. Good speed and steady single-arrow shots."
};

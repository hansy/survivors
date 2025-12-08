/**
 * Weapons define how projectiles behave. Players pick one weapon via players.ts.
 */
export type WeaponDefinition = {
  id: string;
  displayName: string;
  /** Human-friendly description for designers. */
  description: string;
  /** Seconds between volleys. Lower = shoots more often. Typical: 0.4-1.5. */
  cooldown: number;
  /** How long a projectile lives in seconds. Shorter = shorter range. Typical: 0.4-2.5. */
  projectileLifetime: number;
  /** Projectile travel speed in pixels/second. Typical: 200-600. */
  projectileSpeed: number;
  /** Number of projectiles per volley. */
  projectilesPerBurst: number;
  /** Spread angle in degrees between projectiles. 0 = straight line, 360 = full circle. */
  spreadDegrees: number;
};

export const weapons: WeaponDefinition[] = [
  {
    id: "straightShot",
    displayName: "Arrow Shot",
    description: "Fires a single arrow in the last move direction.",
    cooldown: 0.75,
    projectileLifetime: 1.5,
    projectileSpeed: 420,
    projectilesPerBurst: 1,
    spreadDegrees: 0
  },
  {
    id: "circleBurst",
    displayName: "Orbit Nova",
    description: "Shoots a ring of projectiles around the player. Great when surrounded.",
    cooldown: 2.2,
    projectileLifetime: 1.1,
    projectileSpeed: 260,
    projectilesPerBurst: 8,
    spreadDegrees: 360
  }
];

export function getWeaponById(id: string): WeaponDefinition {
  const def = weapons.find((w) => w.id === id);
  if (!def) throw new Error(`Weapon id ${id} not found in config.`);
  return def;
}

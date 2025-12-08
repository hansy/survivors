/**
 * General game settings that control pacing and limits.
 * These are safe for non-technical editors to tweak.
 */
export const gameSettings = {
  /** Target frames per second for Phaser. 60 is standard and smooth. */
  targetFPS: 60,
  /** Width of the arena in pixels. Raise for a larger play area. Typical: 900-1600. */
  arenaWidth: 1200,
  /** Height of the arena in pixels. Raise for a taller play area. Typical: 600-1000. */
  arenaHeight: 720,
  /** How many players are allowed in one room. */
  maxPlayers: 4,
  /** Hard cap on enemies alive at once. Lower to reduce chaos or performance load. */
  maxEnemies: 80,
  /** How often (in seconds) the server sends world snapshots to clients. 0.1 = 10 times/sec. */
  stateBroadcastInterval: 0.1,
  /** If true, players auto-attack without pressing a key. Good for Survivors-style flow. */
  autoAttack: true
} as const;

export type GameSettings = typeof gameSettings;

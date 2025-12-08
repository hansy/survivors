import { enemies } from "./enemies";

/**
 * Wave and spawn pacing. Each wave entry controls what spawns for that window.
 */
export type WaveDefinition = {
  waveNumber: number;
  /** Seconds after game start when this wave begins. */
  startTime: number;
  /** How often to spawn during this wave (seconds). Lower = more frequent. */
  spawnIntervalSeconds: number;
  /** How many enemies appear each spawn event. */
  spawnCount: number;
  /** Which enemy ids can spawn this wave. */
  enemyPool: string[];
  /** Optional multiplier to enemy HP to ramp difficulty. Typical range: 1-3. */
  hpMultiplier?: number;
  /** Optional multiplier to enemy move speed. Typical range: 1-2. */
  speedMultiplier?: number;
  /** Designer-facing description. */
  description: string;
};

export const waves: WaveDefinition[] = [
  {
    waveNumber: 1,
    startTime: 0,
    spawnIntervalSeconds: 2.5,
    spawnCount: 3,
    enemyPool: ["zombie"],
    description: "Warm-up. Slow shamblers only."
  },
  {
    waveNumber: 2,
    startTime: 30,
    spawnIntervalSeconds: 2.0,
    spawnCount: 4,
    enemyPool: ["zombie", "runner"],
    speedMultiplier: 1.05,
    description: "Adds fast runners to keep players moving."
  },
  {
    waveNumber: 3,
    startTime: 60,
    spawnIntervalSeconds: 1.6,
    spawnCount: 5,
    enemyPool: ["zombie", "runner", "brute"],
    hpMultiplier: 1.2,
    description: "Mix of all enemies. Brutes begin appearing."
  }
];

export function getCurrentWave(elapsedSeconds: number): WaveDefinition {
  let wave = waves[0];
  for (const w of waves) {
    if (elapsedSeconds >= w.startTime) {
      wave = w;
    }
  }
  return wave;
}

// Ensures enemy ids are valid at startup. Helps non-technical editors catch typos.
for (const wave of waves) {
  for (const enemyId of wave.enemyPool) {
    if (!enemies.find((e) => e.id === enemyId)) {
      throw new Error(`Wave config references missing enemy id: ${enemyId}`);
    }
  }
}

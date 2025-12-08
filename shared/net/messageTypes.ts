export type Vector2 = { x: number; y: number };

export type PlayerState = {
  id: string;
  name: string;
  position: Vector2;
  hp: number;
  maxHp: number;
  weaponId: string;
};

export type EnemyState = {
  id: string;
  typeId: string;
  position: Vector2;
  hp: number;
  maxHp: number;
};

export type ProjectileState = {
  id: string;
  ownerId: string;
  position: Vector2;
};

export type WorldState = {
  players: PlayerState[];
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  elapsedSeconds: number;
  waveNumber: number;
  score: number;
};

export type ClientInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  lastMoveDir: Vector2;
};

export type ServerToClientEvents = {
  playerJoined: (state: PlayerState) => void;
  stateUpdate: (state: WorldState) => void;
  roomJoined: (roomCode: string) => void;
  disconnectReason: (reason: string) => void;
};

export type ClientToServerEvents = {
  joinRoom: (roomCode: string, playerName: string) => void;
  createRoom: (playerName: string) => void;
  playerInput: (input: ClientInput) => void;
};

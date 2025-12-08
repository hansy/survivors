import { ClientInput, Vector2 } from "../../../shared/net/messageTypes";

export type ServerPlayer = {
  id: string;
  socketId: string;
  name: string;
  position: Vector2;
  hp: number;
  maxHp: number;
  weaponId: string;
  input: ClientInput;
  lastAttackAt: number;
  lastMoveDir: Vector2;
};

export type ServerEnemy = {
  id: string;
  typeId: string;
  position: Vector2;
  hp: number;
  maxHp: number;
};

export type ServerProjectile = {
  id: string;
  ownerId: string;
  position: Vector2;
  direction: Vector2;
  speed: number;
  damage: number;
  createdAt: number;
  lifetime: number;
};

export type RoomState = {
  code: string;
  players: Map<string, ServerPlayer>;
  enemies: Map<string, ServerEnemy>;
  projectiles: Map<string, ServerProjectile>;
  elapsedSeconds: number;
  waveNumber: number;
  score: number;
  lastSpawnAt: number;
  lastBroadcastAt: number;
};

const rooms = new Map<string, RoomState>();

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function createRoom(code: string): RoomState {
  const room: RoomState = {
    code,
    players: new Map(),
    enemies: new Map(),
    projectiles: new Map(),
    elapsedSeconds: 0,
    waveNumber: 1,
    score: 0,
    lastSpawnAt: 0,
    lastBroadcastAt: 0
  };
  rooms.set(code, room);
  return room;
}

export function removeRoom(code: string) {
  rooms.delete(code);
}

export function listRooms(): IterableIterator<RoomState> {
  return rooms.values();
}

export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

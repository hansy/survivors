import { Server } from "socket.io";
import { WorldState } from "../../../shared/net/messageTypes";
import { gameSettings } from "../../../client/src/config/gameSettings";
import { playerConfig } from "../../../client/src/config/players";
import { enemies, getEnemyById } from "../../../client/src/config/enemies";
import { getWeaponById } from "../../../client/src/config/weapons";
import { getCurrentWave } from "../../../client/src/config/waves";
import {
  RoomState,
  ServerEnemy,
  ServerPlayer,
  ServerProjectile
} from "./rooms";

const PLAYER_RADIUS = 14;
const ENEMY_RADIUS = 14;
const PROJECTILE_RADIUS = 6;

function normalize(vec: { x: number; y: number }): { x: number; y: number } {
  const len = Math.hypot(vec.x, vec.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: vec.x / len, y: vec.y / len };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampPosition(pos: { x: number; y: number }) {
  pos.x = Math.max(PLAYER_RADIUS, Math.min(gameSettings.arenaWidth - PLAYER_RADIUS, pos.x));
  pos.y = Math.max(PLAYER_RADIUS, Math.min(gameSettings.arenaHeight - PLAYER_RADIUS, pos.y));
}

function pickEnemyType(pool: string[]): string {
  const options = enemies.filter((e) => pool.includes(e.id));
  const totalWeight = options.reduce((sum, e) => sum + e.spawnWeight, 0);
  let roll = Math.random() * totalWeight;
  for (const opt of options) {
    roll -= opt.spawnWeight;
    if (roll <= 0) return opt.id;
  }
  return options[0]?.id ?? "zombie";
}

function spawnEnemies(room: RoomState, count: number, pool: string[], hpMult = 1, speedMult = 1) {
  for (let i = 0; i < count; i++) {
    const typeId = pickEnemyType(pool);
    const def = getEnemyById(typeId);
    const id = `enemy-${Date.now()}-${Math.random()}`;
    const side = Math.floor(Math.random() * 4);
    const padding = 20;
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = Math.random() * gameSettings.arenaWidth;
      y = padding;
    } else if (side === 1) {
      x = Math.random() * gameSettings.arenaWidth;
      y = gameSettings.arenaHeight - padding;
    } else if (side === 2) {
      x = padding;
      y = Math.random() * gameSettings.arenaHeight;
    } else {
      x = gameSettings.arenaWidth - padding;
      y = Math.random() * gameSettings.arenaHeight;
    }
    const enemy: ServerEnemy = {
      id,
      typeId,
      position: { x, y },
      hp: def.maxHp * hpMult,
      maxHp: def.maxHp * hpMult
    };
    room.enemies.set(id, enemy);
  }
}

function updatePlayerMovement(room: RoomState, dt: number) {
  for (const player of room.players.values()) {
    const moveDir = {
      x: (player.input.right ? 1 : 0) - (player.input.left ? 1 : 0),
      y: (player.input.down ? 1 : 0) - (player.input.up ? 1 : 0)
    };
    if (moveDir.x !== 0 || moveDir.y !== 0) {
      const dir = normalize(moveDir);
      player.lastMoveDir = dir;
      player.position.x += dir.x * playerConfig.moveSpeed * dt;
      player.position.y += dir.y * playerConfig.moveSpeed * dt;
      clampPosition(player.position);
    }
  }
}

function updateEnemyMovement(room: RoomState, dt: number, speedMult: number) {
  for (const enemy of room.enemies.values()) {
    // Find nearest player.
    let target: ServerPlayer | null = null;
    let bestDist = Number.MAX_VALUE;
    for (const player of room.players.values()) {
      const dist = distance(enemy.position, player.position);
      if (dist < bestDist) {
        bestDist = dist;
        target = player;
      }
    }
    if (!target) continue;
    const def = getEnemyById(enemy.typeId);
    const dir = normalize({
      x: target.position.x - enemy.position.x,
      y: target.position.y - enemy.position.y
    });
    enemy.position.x += dir.x * def.moveSpeed * speedMult * dt;
    enemy.position.y += dir.y * def.moveSpeed * speedMult * dt;
  }
}

function handleEnemyPlayerCollisions(room: RoomState) {
  for (const enemy of room.enemies.values()) {
    const def = getEnemyById(enemy.typeId);
    for (const player of room.players.values()) {
      const dist = distance(enemy.position, player.position);
      if (dist < PLAYER_RADIUS + ENEMY_RADIUS) {
        player.hp = Math.max(0, player.hp - def.contactDamage);
      }
    }
  }
}

function handleProjectiles(room: RoomState, dt: number) {
  for (const projectile of Array.from(room.projectiles.values())) {
    projectile.position.x += projectile.direction.x * projectile.speed * dt;
    projectile.position.y += projectile.direction.y * projectile.speed * dt;
    const aliveTime = (Date.now() - projectile.createdAt) / 1000;
    if (aliveTime > projectile.lifetime) {
      room.projectiles.delete(projectile.id);
      continue;
    }
    for (const enemy of Array.from(room.enemies.values())) {
      if (distance(projectile.position, enemy.position) < ENEMY_RADIUS + PROJECTILE_RADIUS) {
        enemy.hp -= projectile.damage;
        room.projectiles.delete(projectile.id);
        if (enemy.hp <= 0) {
          const def = getEnemyById(enemy.typeId);
          room.score += def.xpValue;
          room.enemies.delete(enemy.id);
        }
        break;
      }
    }
  }
}

function handleAutoAttacks(room: RoomState) {
  if (!gameSettings.autoAttack) return;
  const now = Date.now();
  for (const player of room.players.values()) {
    const weapon = getWeaponById(player.weaponId);
    if (now - player.lastAttackAt < weapon.cooldown * 1000) continue;
    player.lastAttackAt = now;
    const baseDir =
      player.lastMoveDir.x === 0 && player.lastMoveDir.y === 0
        ? { x: 1, y: 0 }
        : player.lastMoveDir;

    const projectiles: ServerProjectile[] = [];
    if (weapon.spreadDegrees >= 360) {
      const step = 360 / weapon.projectilesPerBurst;
      for (let i = 0; i < weapon.projectilesPerBurst; i++) {
        const angle = (i * step * Math.PI) / 180;
        projectiles.push({
          id: `proj-${now}-${Math.random()}-${i}`,
          ownerId: player.id,
          position: { ...player.position },
          direction: { x: Math.cos(angle), y: Math.sin(angle) },
          speed: weapon.projectileSpeed,
          damage: playerConfig.baseDamage,
          createdAt: now,
          lifetime: weapon.projectileLifetime
        });
      }
    } else {
      const dir = normalize(baseDir);
      projectiles.push({
        id: `proj-${now}-${Math.random()}`,
        ownerId: player.id,
        position: { ...player.position },
        direction: dir,
        speed: weapon.projectileSpeed,
        damage: playerConfig.baseDamage,
        createdAt: now,
        lifetime: weapon.projectileLifetime
      });
    }
    for (const proj of projectiles) {
      room.projectiles.set(proj.id, proj);
    }
  }
}

function buildWorldState(room: RoomState): WorldState {
  return {
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      hp: p.hp,
      maxHp: p.maxHp,
      weaponId: p.weaponId
    })),
    enemies: Array.from(room.enemies.values()).map((e) => ({
      id: e.id,
      typeId: e.typeId,
      position: e.position,
      hp: e.hp,
      maxHp: e.maxHp
    })),
    projectiles: Array.from(room.projectiles.values()).map((proj) => ({
      id: proj.id,
      ownerId: proj.ownerId,
      position: proj.position
    })),
    elapsedSeconds: room.elapsedSeconds,
    waveNumber: room.waveNumber,
    score: room.score
  };
}

export function tickRoom(io: Server, room: RoomState, dt: number) {
  room.elapsedSeconds += dt;
  const wave = getCurrentWave(room.elapsedSeconds);
  room.waveNumber = wave.waveNumber;

  // Spawning
  if (
    room.enemies.size < gameSettings.maxEnemies &&
    room.elapsedSeconds - room.lastSpawnAt > wave.spawnIntervalSeconds
  ) {
    room.lastSpawnAt = room.elapsedSeconds;
    spawnEnemies(
      room,
      wave.spawnCount,
      wave.enemyPool,
      wave.hpMultiplier ?? 1,
      wave.speedMultiplier ?? 1
    );
  }

  updatePlayerMovement(room, dt);
  updateEnemyMovement(room, dt, wave.speedMultiplier ?? 1);
  handleEnemyPlayerCollisions(room);
  handleAutoAttacks(room);
  handleProjectiles(room, dt);

  const now = Date.now();
  if (now - room.lastBroadcastAt > gameSettings.stateBroadcastInterval * 1000) {
    room.lastBroadcastAt = now;
    const state = buildWorldState(room);
    io.to(room.code).emit("stateUpdate", state);
  }
}

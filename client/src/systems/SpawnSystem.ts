import { Scene } from "phaser";
import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import {
  EnemyState,
  PlayerState,
  ProjectileState
} from "../../../shared/net/messageTypes";

export class SpawnSystem {
  private scene: Scene;
  private players: Map<string, Player>;
  private enemies: Map<string, Enemy>;
  private projectiles: Map<string, Projectile>;

  constructor(
    scene: Scene,
    players: Map<string, Player>,
    enemies: Map<string, Enemy>,
    projectiles: Map<string, Projectile>
  ) {
    this.scene = scene;
    this.players = players;
    this.enemies = enemies;
    this.projectiles = projectiles;
  }

  syncPlayers(states: PlayerState[]) {
    const existingIds = new Set(this.players.keys());
    for (const state of states) {
      if (!this.players.has(state.id)) {
        this.players.set(state.id, new Player(this.scene, state));
      }
      this.players.get(state.id)!.updateFromState(state);
      existingIds.delete(state.id);
    }
    for (const staleId of existingIds) {
      this.players.get(staleId)?.destroy();
      this.players.delete(staleId);
    }
  }

  syncEnemies(states: EnemyState[]) {
    const existingIds = new Set(this.enemies.keys());
    for (const state of states) {
      if (!this.enemies.has(state.id)) {
        this.enemies.set(state.id, new Enemy(this.scene, state));
      }
      this.enemies.get(state.id)!.updateFromState(state);
      existingIds.delete(state.id);
    }
    for (const staleId of existingIds) {
      this.enemies.get(staleId)?.destroy();
      this.enemies.delete(staleId);
    }
  }

  syncProjectiles(states: ProjectileState[]) {
    const existingIds = new Set(this.projectiles.keys());
    for (const state of states) {
      if (!this.projectiles.has(state.id)) {
        this.projectiles.set(state.id, new Projectile(this.scene, state));
      }
      this.projectiles.get(state.id)!.updateFromState(state);
      existingIds.delete(state.id);
    }
    for (const staleId of existingIds) {
      this.projectiles.get(staleId)?.destroy();
      this.projectiles.delete(staleId);
    }
  }
}

import Phaser from "phaser";
import { EnemyState } from "../../../shared/net/messageTypes";
import { getEnemyById } from "../config/enemies";

export class Enemy {
  sprite: Phaser.GameObjects.Arc;
  id: string;

  constructor(scene: Phaser.Scene, state: EnemyState) {
    this.id = state.id;
    const cfg = getEnemyById(state.typeId);
    this.sprite = scene.add.circle(state.position.x, state.position.y, 14, cfg.color);
  }

  updateFromState(state: EnemyState) {
    this.sprite.setPosition(state.position.x, state.position.y);
  }

  destroy() {
    this.sprite.destroy();
  }
}

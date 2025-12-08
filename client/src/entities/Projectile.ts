import Phaser from "phaser";
import { assets } from "../config/assets";
import { ProjectileState } from "../../../shared/net/messageTypes";

export class Projectile {
  sprite: Phaser.GameObjects.Arc;
  id: string;

  constructor(scene: Phaser.Scene, state: ProjectileState) {
    this.id = state.id;
    this.sprite = scene.add.circle(
      state.position.x,
      state.position.y,
      assets.projectile.size,
      assets.projectile.color
    );
  }

  updateFromState(state: ProjectileState) {
    this.sprite.setPosition(state.position.x, state.position.y);
  }

  destroy() {
    this.sprite.destroy();
  }
}

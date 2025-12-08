import Phaser from "phaser";
import { assets } from "../config/assets";
import { PlayerState } from "../../../shared/net/messageTypes";

export class Player {
  sprite: Phaser.GameObjects.Arc;
  nameTag: Phaser.GameObjects.Text;
  id: string;

  constructor(scene: Phaser.Scene, state: PlayerState) {
    this.id = state.id;
    this.sprite = scene.add.circle(
      state.position.x,
      state.position.y,
      assets.player.size,
      assets.player.color
    );
    this.nameTag = scene.add.text(state.position.x, state.position.y - 28, state.name, {
      fontSize: "12px",
      color: "#e8edf2",
      fontFamily: "sans-serif"
    }).setOrigin(0.5);
  }

  updateFromState(state: PlayerState) {
    this.sprite.setPosition(state.position.x, state.position.y);
    this.nameTag.setPosition(state.position.x, state.position.y - 28);
  }

  setTint(color: number) {
    this.sprite.setFillStyle(color);
  }

  destroy() {
    this.sprite.destroy();
    this.nameTag.destroy();
  }
}

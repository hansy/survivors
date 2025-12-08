import Phaser from "phaser";
import { assets } from "../config/assets";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Generate simple textures so we don't need external image assets.
    const g = this.add.graphics();

    g.fillStyle(assets.player.color, 1);
    g.fillCircle(assets.player.size, assets.player.size, assets.player.size);
    g.generateTexture(assets.player.key, assets.player.size * 2, assets.player.size * 2);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillCircle(18, 18, 18);
    g.generateTexture(assets.enemy.key, 36, 36);
    g.clear();

    g.fillStyle(assets.projectile.color, 1);
    g.fillCircle(assets.projectile.size, assets.projectile.size, assets.projectile.size);
    g.generateTexture(
      assets.projectile.key,
      assets.projectile.size * 2,
      assets.projectile.size * 2
    );
    g.destroy();
  }

  create() {
    this.scene.start("LobbyScene");
  }
}

import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { LobbyScene } from "./scenes/LobbyScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import { gameSettings } from "./config/gameSettings";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: gameSettings.arenaWidth,
  height: gameSettings.arenaHeight,
  backgroundColor: "#10141c",
  physics: { default: "arcade" },
  fps: { target: gameSettings.targetFPS },
  dom: { createContainer: true },
  scene: [BootScene, LobbyScene, GameScene, UIScene]
};

// eslint-disable-next-line no-new
new Phaser.Game(config);

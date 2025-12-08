import Phaser from "phaser";
import { assets } from "../config/assets";
import { gameSettings } from "../config/gameSettings";
import { MovementSystem } from "../systems/MovementSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { CombatSystem } from "../systems/CombatSystem";
import { NetworkSystem } from "../systems/NetworkSystem";
import { getSocket } from "../net/socketClient";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import {
  WorldState,
  ServerToClientEvents,
  ClientToServerEvents
} from "../../../shared/net/messageTypes";
import { Socket } from "socket.io-client";

type GameSceneData = {
  playerName: string;
  roomCode?: string;
  createNew: boolean;
};

export class GameScene extends Phaser.Scene {
  private movementSystem!: MovementSystem;
  private spawnSystem!: SpawnSystem;
  private combatSystem!: CombatSystem;
  private networkSystem!: NetworkSystem;

  private players = new Map<string, Player>();
  private enemies = new Map<string, Enemy>();
  private projectiles = new Map<string, Projectile>();

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private myPlayerId: string | null = null;
  private roomCode: string | undefined;
  private lastState: WorldState | null = null;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: GameSceneData) {
    this.roomCode = data.roomCode;
  }

  create(data: GameSceneData) {
    this.cameras.main.setBackgroundColor(assets.backgroundColor);

    this.movementSystem = new MovementSystem(this);
    this.spawnSystem = new SpawnSystem(this, this.players, this.enemies, this.projectiles);
    this.combatSystem = new CombatSystem(this.players);

    this.socket = getSocket();
    this.networkSystem = new NetworkSystem(this.socket);

    this.registerSocketEvents(data);

    // Start the UI overlay scene.
    this.scene.launch("UIScene", { roomCode: data.roomCode });

    // Draw arena boundary for orientation.
    const rect = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      gameSettings.arenaWidth,
      gameSettings.arenaHeight
    );
    rect.setStrokeStyle(2, 0x1f2b3a, 1);
  }

  private registerSocketEvents(data: GameSceneData) {
    this.socket.off("playerJoined");
    this.socket.off("stateUpdate");
    this.socket.off("roomJoined");

    this.socket.on("playerJoined", (state) => {
      // First join event lets us know our server id.
      if (!this.myPlayerId && state.name === data.playerName) {
        this.myPlayerId = state.id;
      }
    });

    this.socket.on("stateUpdate", (state) => {
      this.lastState = state;
      this.spawnSystem.syncPlayers(state.players);
      this.spawnSystem.syncEnemies(state.enemies);
      this.spawnSystem.syncProjectiles(state.projectiles);
      this.combatSystem.updatePlayerVisuals(state.players);

      // Notify UI scene about HUD values.
      const me = state.players.find((p) => p.id === this.myPlayerId);
      this.game.events.emit("hudUpdate", {
        hp: me?.hp ?? 0,
        maxHp: me?.maxHp ?? 1,
        waveNumber: state.waveNumber,
        elapsedSeconds: state.elapsedSeconds,
        score: state.score,
        roomCode: this.roomCode
      });
    });

    this.socket.on("roomJoined", (roomCode) => {
      this.roomCode = roomCode;
      this.game.events.emit("roomJoined", roomCode);
    });

    if (data.createNew) {
      this.socket.emit("createRoom", data.playerName);
    } else {
      this.socket.emit("joinRoom", data.roomCode ?? "", data.playerName);
    }
  }

  update() {
    const input = this.movementSystem.getInput();
    this.networkSystem.sendInput(input);
  }
}

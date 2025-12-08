import Phaser from "phaser";

type HudPayload = {
  hp: number;
  maxHp: number;
  waveNumber: number;
  elapsedSeconds: number;
  score: number;
  roomCode?: string;
};

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private roomText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "UIScene" });
  }

  create(data: { roomCode?: string }) {
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(16, 14, "HP", { fontSize: "14px", color: "#e8edf2" });
    this.roomText = this.add.text(16, 38, `Room: ${data.roomCode ?? "?"}`, {
      fontSize: "13px",
      color: "#8ea2bf"
    });
    this.infoText = this.add.text(16, 60, "Wave 1 | 00:00 | Score 0", {
      fontSize: "13px",
      color: "#e8edf2"
    });

    this.game.events.on("hudUpdate", this.onHudUpdate, this);
    this.game.events.on("roomJoined", (code: string) => {
      this.roomText.setText(`Room: ${code}`);
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("hudUpdate", this.onHudUpdate, this);
    });
  }

  private onHudUpdate(payload: HudPayload) {
    this.updateHpBar(payload.hp, payload.maxHp);
    const mins = Math.floor(payload.elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(payload.elapsedSeconds % 60)
      .toString()
      .padStart(2, "0");
    this.infoText.setText(
      `Wave ${payload.waveNumber} | ${mins}:${secs} | Score ${payload.score}`
    );
    if (payload.roomCode) this.roomText.setText(`Room: ${payload.roomCode}`);
  }

  private updateHpBar(hp: number, maxHp: number) {
    const pct = Phaser.Math.Clamp(hp / maxHp, 0, 1);
    const width = 160;
    const height = 10;
    this.hpBar.clear();
    this.hpBar.fillStyle(0x1c2635);
    this.hpBar.fillRoundedRect(14, 12, width, height, 4);
    this.hpBar.fillStyle(0x30d158);
    this.hpBar.fillRoundedRect(14, 12, width * pct, height, 4);
    this.hpText.setText(`HP: ${Math.max(0, Math.round(hp))}/${maxHp}`);
  }
}

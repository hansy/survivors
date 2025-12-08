import Phaser from "phaser";

type LobbyData = { roomCode?: string };

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }

  create(data: LobbyData) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.add
      .text(centerX, centerY - 140, "Survivors Co-op", {
        fontSize: "32px",
        fontFamily: "sans-serif",
        color: "#e8edf2"
      })
      .setOrigin(0.5);

    const form = document.createElement("div");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "8px";
    form.style.background = "#161c26";
    form.style.padding = "16px";
    form.style.borderRadius = "8px";
    form.style.minWidth = "260px";
    form.style.boxShadow = "0 4px 18px rgba(0,0,0,0.35)";
    form.innerHTML = `
      <label style="color:#bfc7d5;font-size:14px;">Player name</label>
      <input id="playerName" style="padding:8px;border-radius:6px;border:1px solid #2a3342;background:#0f141c;color:#e8edf2;" value="Hero">
      <label style="color:#bfc7d5;font-size:14px;">Room code</label>
      <input id="roomCode" style="padding:8px;border-radius:6px;border:1px solid #2a3342;background:#0f141c;color:#e8edf2;" value="${
        data.roomCode ?? ""
      }" placeholder="e.g. JUMP">
      <div style="display:flex;gap:8px;justify-content:space-between;margin-top:8px;">
        <button id="createBtn" style="flex:1;padding:10px;border:none;border-radius:6px;background:#3cb179;color:#0d1117;font-weight:bold;cursor:pointer;">Create Game</button>
        <button id="joinBtn" style="flex:1;padding:10px;border:1px solid #3cb179;border-radius:6px;background:transparent;color:#3cb179;font-weight:bold;cursor:pointer;">Join Game</button>
      </div>
    `;

    const dom = this.add.dom(centerX, centerY, form);
    dom.addListener("click");
    dom.on("click", (event: any) => {
      const target = event.target as HTMLElement;
      if (target.id === "createBtn" || target.id === "joinBtn") {
        const playerName = (form.querySelector("#playerName") as HTMLInputElement).value || "Hero";
        const roomCodeInput = (form.querySelector("#roomCode") as HTMLInputElement).value.trim();
        const createNew = target.id === "createBtn";
        this.scene.start("GameScene", { playerName, roomCode: roomCodeInput, createNew });
      }
    });
  }
}

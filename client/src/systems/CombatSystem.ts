import Phaser from "phaser";
import { Player } from "../entities/Player";
import { PlayerState } from "../../../shared/net/messageTypes";

/**
 * Client-side combat feedback (tints for low HP). The real damage math lives on the server.
 */
export class CombatSystem {
  private players: Map<string, Player>;

  constructor(players: Map<string, Player>) {
    this.players = players;
  }

  updatePlayerVisuals(states: PlayerState[]) {
    for (const state of states) {
      const player = this.players.get(state.id);
      if (!player) continue;
      const hpPercent = state.hp / state.maxHp;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        new Phaser.Display.Color(255, 76, 76),
        new Phaser.Display.Color(116, 185, 255),
        100,
        hpPercent * 100
      );
      player.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    }
  }
}

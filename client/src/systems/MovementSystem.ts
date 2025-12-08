import Phaser from "phaser";
import { ClientInput } from "../../../shared/net/messageTypes";

export class MovementSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<string, Phaser.Input.Keyboard.Key>;
  private lastMoveDir = { x: 1, y: 0 };

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard.addKey("W"),
      A: scene.input.keyboard.addKey("A"),
      S: scene.input.keyboard.addKey("S"),
      D: scene.input.keyboard.addKey("D")
    };
  }

  getInput(): ClientInput {
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    const dir = { x: 0, y: 0 };
    if (up) dir.y -= 1;
    if (down) dir.y += 1;
    if (left) dir.x -= 1;
    if (right) dir.x += 1;

    if (dir.x !== 0 || dir.y !== 0) {
      const len = Math.hypot(dir.x, dir.y);
      this.lastMoveDir = { x: dir.x / len, y: dir.y / len };
    }

    return {
      up,
      down,
      left,
      right,
      lastMoveDir: this.lastMoveDir
    };
  }
}

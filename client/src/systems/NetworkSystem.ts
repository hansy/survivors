import { Socket } from "socket.io-client";
import {
  ClientInput,
  ClientToServerEvents,
  ServerToClientEvents
} from "../../../shared/net/messageTypes";

/**
 * Small helper to send throttled input to the server.
 */
export class NetworkSystem {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private lastSent = 0;
  private minIntervalMs = 50;

  constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
    this.socket = socket;
  }

  sendInput(input: ClientInput) {
    const now = performance.now();
    if (now - this.lastSent < this.minIntervalMs) return;
    this.lastSent = now;
    this.socket.emit("playerInput", input);
  }
}

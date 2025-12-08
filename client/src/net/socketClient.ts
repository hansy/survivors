import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents
} from "../../../shared/net/messageTypes";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io("http://localhost:3000");
  }
  return socket;
}

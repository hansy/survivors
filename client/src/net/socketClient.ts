import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents
} from "../../../shared/net/messageTypes";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ??
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    socket = io(socketUrl);
  }
  return socket;
}

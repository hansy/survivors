import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents
} from "../../shared/net/messageTypes";
import {
  RoomState,
  ServerPlayer,
  createRoom,
  generateRoomCode,
  getRoom,
  listRooms,
  removeRoom
} from "./net/rooms";
import { playerConfig } from "../../client/src/config/players";
import { tickRoom } from "./net/gameLoop";
import { gameSettings } from "../../client/src/config/gameSettings";

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: "*" }
});

const TICK_RATE = 30;

function createServerPlayer(socketId: string, name: string): ServerPlayer {
  return {
    id: socketId,
    socketId,
    name,
    position: { x: gameSettings.arenaWidth / 2, y: gameSettings.arenaHeight / 2 },
    hp: playerConfig.maxHp,
    maxHp: playerConfig.maxHp,
    weaponId: playerConfig.weaponId,
    input: { up: false, down: false, left: false, right: false, lastMoveDir: { x: 1, y: 0 } },
    lastAttackAt: 0,
    lastMoveDir: { x: 1, y: 0 }
  };
}

function addPlayerToRoom(room: RoomState, player: ServerPlayer, socketId: string) {
  room.players.set(socketId, player);
}

function removePlayerFromRooms(socketId: string) {
  for (const room of listRooms()) {
    if (room.players.has(socketId)) {
      room.players.delete(socketId);
      if (room.players.size === 0) {
        removeRoom(room.code);
      }
      break;
    }
  }
}

function findRoomBySocket(socketId: string): RoomState | undefined {
  for (const room of listRooms()) {
    if (room.players.has(socketId)) return room;
  }
  return undefined;
}

io.on("connection", (socket) => {
  socket.on("createRoom", (playerName: string) => {
    const code = generateRoomCode();
    const room = createRoom(code);
    const player = createServerPlayer(socket.id, playerName);
    addPlayerToRoom(room, player, socket.id);
    socket.join(code);
    socket.emit("roomJoined", code);
    io.to(code).emit("playerJoined", player);
  });

  socket.on("joinRoom", (roomCode: string, playerName: string) => {
    const code = roomCode && roomCode.trim() !== "" ? roomCode.trim().toUpperCase() : generateRoomCode();
    const room = getRoom(code) ?? createRoom(code);
    const player = createServerPlayer(socket.id, playerName);
    addPlayerToRoom(room, player, socket.id);
    socket.join(code);
    socket.emit("roomJoined", code);
    io.to(code).emit("playerJoined", player);
  });

  socket.on("playerInput", (input) => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player) return;
    player.input = input;
    player.lastMoveDir = input.lastMoveDir;
  });

  socket.on("disconnect", () => {
    removePlayerFromRooms(socket.id);
  });
});

setInterval(() => {
  const dt = 1 / TICK_RATE;
  for (const room of listRooms()) {
    tickRoom(io, room, dt);
  }
}, 1000 / TICK_RATE);

app.get("/", (_, res) => {
  res.send("Survivors Co-op server running.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

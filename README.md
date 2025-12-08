# Survivors Co-op (Phaser 3 + Socket.IO)

Lightweight co-op Survivors-style slice with Phaser 3 in the browser and a tiny Socket.IO server. Gameplay knobs live in commented config files so non-technical teammates can tune balance without touching engine code.

## How to run
1. Install deps (root): `bun install`
2. Start both client (Vite) and server: `bun run dev`
   - Client dev server: http://localhost:5173
   - Game server: http://localhost:3000
3. In the browser, create a room or join an existing room code. Open the page in multiple tabs to test co-op.

## Folder structure (team mental model)
- `client/` – Phaser front-end
  - `src/config/` – **All balance knobs** (players, enemies, weapons, waves, game settings, assets).
  - `src/entities/` – Simple render wrappers for players/enemies/projectiles.
  - `src/systems/` – Movement input, spawn sync, combat visuals, network helper.
  - `src/scenes/` – Boot, Lobby, Game, UI overlay.
  - `src/net/` – Socket.IO client glue.
- `server/` – Socket.IO + game loop (authoritative simulation).
- `shared/` – Message types shared by client and server.

## Editing gameplay knobs (open these files)
- `client/src/config/players.ts` – Player HP, speed, damage, attack rate, starting weapon. Example: increase `moveSpeed` to make players kite faster.
- `client/src/config/enemies.ts` – Enemy HP, damage, speed, spawn weight, XP value, color. Example: to make zombies faster, raise `moveSpeed` on `zombie` from 70 to 90.
- `client/src/config/weapons.ts` – Cooldowns, projectile speed, lifetime, spread, and burst count. Example: lower `cooldown` on `straightShot` for faster firing.
- `client/src/config/waves.ts` – When waves start, how many enemies spawn, which enemy pool to use, and difficulty multipliers.
- `client/src/config/gameSettings.ts` – Arena size, FPS, max players/enemies, state broadcast frequency, auto-attack toggle.
- `client/src/config/assets.ts` – Placeholder colors/sizes if designers want a quick reskin.

Each config field has a plain-English comment with typical value ranges. These files are the safe place for non-technical edits; no code changes needed for basic balance tweaks.

## Gameplay loop
- WASD/arrow keys to move.
- Auto-attacks fire using the current weapon definition.
- Enemies spawn at arena edges based on wave timing and chase the nearest player.
- Projectiles damage enemies; enemies damage players on contact.
- Server is authoritative: clients send inputs, server simulates movement/combat, then broadcasts snapshots.

## Networking
- Client connects via `socket.io-client` (see `client/src/net/socketClient.ts`).
- Server manages rooms and simulation ticks (`server/src/server.ts`, `server/src/net/gameLoop.ts`).
- Messages are typed in `shared/net/messageTypes.ts` for both client and server.

## Customizing / extending
- Add new enemies: duplicate an entry in `config/enemies.ts`, then reference its `id` inside `config/waves.ts`.
- Add weapons: create a new entry in `config/weapons.ts`, then set `weaponId` in `config/players.ts`.
- Adjust pacing: tweak `spawnIntervalSeconds` and `spawnCount` per wave; bump `hpMultiplier`/`speedMultiplier` for ramping difficulty.
- Change arena feel: edit `arenaWidth`/`arenaHeight` in `gameSettings.ts` and the UI will adapt.

## Notes
- Assets are procedurally generated circles; designers can swap to images later by adjusting `assets.ts` and `BootScene`.
- The server runs a 30 TPS loop and broadcasts snapshots ~10 times/sec; tune `gameSettings.stateBroadcastInterval` for bandwidth vs. smoothness.

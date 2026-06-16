## Context

In MVP 1, we built a fully local game running inside a single browser tab. For MVP 2, we need to transition to a server-validated online multiplayer architecture. We will introduce a NestJS backend located under `apps/api` and connect it to a Supabase database. All game logic validations will shift from the client to the server, and clients will synchronize their visual views in real-time via Supabase Realtime subscription channels.

## Goals / Non-Goals

**Goals:**
- Initialize the backend NestJS service under `apps/api`.
- Create a relational database schema in Supabase containing rooms, players, properties, and logs.
- Implement room creation, listing, code-based joining, and readiness lobbies in NestJS.
- Move game state validation (active player check, rolling dice numbers, checking cash reserves, checking property ownership, resolving rents) to backend NestJS controllers.
- Broadcast database updates to all clients in real-time using Supabase Realtime.
- Refactor `gameStore.js` on the client to send actions to the NestJS API and subscribe to Supabase updates.

**Non-Goals:**
- Advanced matchmaking (we rely on direct 6-digit code entry).
- Persisted accounts (users will register guest names on game entry).
- Persistent ranking boards or history archives (games are deleted/cleaned up when finished).
- Reconnect/disconnect persistence (disconnecting players are immediately removed).

## Decisions

### 1. Database Schema
We will create four tables in Supabase:
- **`rooms`**:
  - `id` (uuid, primary key)
  - `code` (text, unique 6-character code)
  - `status` (text: 'LOBBY', 'PLAYING', 'FINISHED')
  - `created_at` (timestamp)
- **`players`**:
  - `id` (uuid, primary key)
  - `room_id` (uuid, foreign key -> rooms.id)
  - `name` (text)
  - `color` (text)
  - `money` (int)
  - `position` (int)
  - `is_bankrupt` (boolean)
  - `is_host` (boolean)
- **`properties`**:
  - `room_id` (uuid, primary key, foreign key -> rooms.id)
  - `slot_id` (int, primary key)
  - `owner_id` (uuid, foreign key -> players.id, nullable)
- **`logs`**:
  - `id` (uuid, primary key)
  - `room_id` (uuid, foreign key -> rooms.id)
  - `text` (text)
  - `color` (text)
  - `created_at` (timestamp)

### 2. State Sync Architecture: Supabase Realtime Channels
- **Decision**: Clients will subscribe to Supabase Realtime events filtered by `room_id` for tables `players`, `properties`, and `logs`.
- **Rationale**: This enables low-latency, declarative sync. Instead of maintaining WebSockets inside NestJS, we delegate the scaling and message broadcasting of the database rows to Supabase Realtime. When NestJS writes updates, Supabase automatically pushes them to the browser.
- **Alternatives considered**: Socket.io in NestJS. This would require keeping all game state in Redis or NestJS server memory, increasing state complexity. Relying on DB-driven sync keeps the system stateless.

### 3. Server-Side Trusted Execution
- **Decision**: The client cannot alter their own money, move tokens, or assign property ownership directly. They make REST requests (e.g. `POST /api/rooms/:code/roll` or `POST /api/rooms/:code/buy`) to NestJS.
- **Rationale**: Prevents client-side manipulation (cheating). The server queries the DB for the requesting player's state, runs the calculations, and updates the DB rows, triggering the broadcast.

## Risks / Trade-offs

- **Risk**: Database write overhead on every step during movement animations.
  - **Mitigation**: The token movement animation runs step-by-step on the client locally. The server only updates the final target position.
- **Risk**: Realtime sync delays causing out-of-order logs.
  - **Mitigation**: Sort logs using a sequential sequence number or `created_at` timestamp.

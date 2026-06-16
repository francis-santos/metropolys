## Why

Currently, Project Metropolys only supports local hotseat play. To enable online competitive gaming, we need to build the multiplayer infrastructure to matchmake players into game rooms, sync the game state in real-time, and validate all player operations on a trusted server (NestJS backend and Supabase) to prevent cheating.

## What Changes

- **Backend Scaffolding**: Create a NestJS project inside `apps/api` in the monorepo workspace.
- **Supabase Integration**: Set up Supabase DB tables for rooms, players, and match records. Configure Supabase Realtime Channels for broadcasting board updates.
- **Lobby & Matchmaking**: Provide APIs to create rooms, join rooms by code, and track player lobby readiness.
- **Real-Time Synchronization**: Sincronização em tempo real of active turn positions, token movements, money balances, property ownerships, and log entries to all connected clients.
- **Server-Side Validation**: Validate dice rolls, property purchases, and turn endings on the NestJS backend to verify transaction legibility before committing state changes.
- **Client Synchronization**: Update the Vue game store to communicate with the NestJS API and subscribe to Supabase Realtime updates.

## Capabilities

### New Capabilities

- `multiplayer-rooms`: Management of game rooms, lobby matchmaking, player list tracking, and game launch signals.
- `game-state-sync`: Real-time synchronization of board states, player balances, properties ownership, and turn states.
- `backend-validation`: Server-side rules validation (checking player turn validity, cash verification before buying, dice roll authenticity) before state transition updates.

### Modified Capabilities

- `game-loop`: Update turn cycles, dice-rolling, property purchases, and rent resolutions to rely on backend validation and synchronization instead of purely in-memory execution.

## Impact

- **New Backend Service**: A NestJS API will be initialized under `apps/api`.
- **Database Schema**: New database tables in Supabase (e.g., `rooms`, `game_states`, `logs`).
- **Client Networking**: `apps/web` will import the `@supabase/supabase-js` SDK and use Axios/Fetch to communicate with `apps/api` endpoints, switching from local memory to network subscriptions.

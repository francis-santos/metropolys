## 1. Backend Project Initialization and Database Tables

- [ ] 1.1 Scaffold a NestJS workspace under `apps/api` in the monorepo
- [ ] 1.2 Install NestJS database modules and `@supabase/supabase-js` server libraries
- [ ] 1.3 Create SQL migration scripts in Supabase to set up `rooms`, `players`, `properties`, and `logs` tables

## 2. API Lobby and Matchmaking Enpoints

- [ ] 2.1 Code NestJS controller and service endpoints to handle `POST /api/rooms` (Create Room) returning a unique 6-character code
- [ ] 2.2 Code NestJS endpoint `POST /api/rooms/:code/join` (Join Room) to add guest players to the lobby database records
- [ ] 2.3 Refactor client Home Screen UI in `apps/web` to support inputs for joining by room code or creating online rooms

## 3. Server-side Rules Validation

- [ ] 3.1 Implement NestJS verification guards to check that incoming client actions match the active player turn
- [ ] 3.2 Implement server endpoint for rolling dice, calculating new coordinates, and writing the final position to database
- [ ] 3.3 Implement server endpoint for buying property, validating player funds, and updating ownership records in database
- [ ] 3.4 Implement server endpoint for ending turn and rotating active turn index to the next non-bankrupt player

## 4. Real-time Synchronization (Supabase client)

- [ ] 4.1 Install `@supabase/supabase-js` client SDK in the frontend client (`apps/web`)
- [ ] 4.2 Refactor `gameStore.js` to dispatch REST requests to NestJS server endpoints instead of writing local memory changes
- [ ] 4.3 Implement Supabase Realtime subscriptions in `gameStore.js` to listen to DB changes (players, properties, logs) and sync local states
- [ ] 4.4 Configure client event dispatching to synchronize Phaser token movements with incoming realtime database broadcasts

## 5. Security Validation & Testing

- [ ] 5.1 Run two concurrent browser sessions locally to manually verify real-time multiplayer synchronization
- [ ] 5.2 Test security constraints by sending simulated out-of-turn requests and verifying server validation blocks

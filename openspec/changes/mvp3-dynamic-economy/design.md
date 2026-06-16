## Context

MVP 3 shifts Project Metropolys from a standard board game to a dynamic, strategic simulator. We will implement server-side systems to trigger city events, host real-time property auctions with automatic timer extensions, and coordinate bilateral peer-to-peer trade deals.

## Goals / Non-Goals

**Goals:**
- Implement a round-counter engine in NestJS that triggers random city events (changing neighborhood rent modifiers) every 5 rounds.
- Implement a real-time property auction manager using server-side timers.
- Implement a peer-to-peer trading service that validates player assets before executing property/cash swaps.
- Update the Phaser board scene to procedurally render neighborhood multiplier labels on slot cards.
- Add Vuetify dialog overlays for submitting bids and drafting trading proposals on the client.

**Non-Goals:**
- Complex trade counter-proposals (trading is limited to Accept or Decline in this version).
- Mortgage adjustments or multi-item trade drafts (exchanges are restricted to cash and/or single properties).
- Auction bid withdrawals (once submitted, bids cannot be retracted).

## Decisions

### 1. Database Schema Expansions
We will add three tables to the database in Supabase:
- **`neighborhood_modifiers`**:
  - `room_id` (uuid, primary key)
  - `neighborhood` (text, primary key)
  - `multiplier` (float, default: 1.0)
  - `event_name` (text, descriptive name of active event)
- **`auctions`**:
  - `id` (uuid, primary key)
  - `room_id` (uuid, foreign key -> rooms.id)
  - `slot_id` (int)
  - `highest_bid` (int)
  - `highest_bidder_id` (uuid, foreign key -> players.id, nullable)
  - `ends_at` (timestamp)
  - `status` (text: 'ACTIVE', 'FINISHED')
- **`trades`**:
  - `id` (uuid, primary key)
  - `room_id` (uuid, foreign key -> rooms.id)
  - `sender_id` (uuid, foreign key -> players.id)
  - `receiver_id` (uuid, foreign key -> players.id)
  - `offer_cash` (int)
  - `offer_property_ids` (int[])
  - `request_property_ids` (int[])
  - `status` (text: 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')

### 2. Server-Side Auction Timer Loop
- **Decision**: NestJS will run the countdown timers in memory. When a bid is submitted, the server updates the `ends_at` timestamp in the database. If `ends_at - now` is less than 10 seconds, the server sets `ends_at` to `now + 10s`.
- **Rationale**: Prevents client-side clock desynchronization and mitigates sniper bids (sniping), ensuring all players get a fair chance to respond to late bids.

### 3. Concurrency Checks for Bilateral Trades
- **Decision**: When a trade is accepted, NestJS will run a database transaction to re-verify that the sender still owns the offered property, has enough cash, and that the receiver still owns the requested property.
- **Rationale**: If player Alice proposes a trade to Bob, but in the meantime Alice lands on a tax slot and goes bankrupt (or loses assets), the trade must not execute. Re-verifying ownership inside a transaction prevents duplicate property creation or negative balances.

## Risks / Trade-offs

- **Risk**: Phaser canvas redraw lags when multiple active event multipliers are updated.
  - **Mitigation**: Instead of constant redraws, the Phaser scene will hook into database modification events and only update the slot card text containers when a new round event triggers.

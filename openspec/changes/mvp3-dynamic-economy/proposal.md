## Why

Currently, Project Metropolys behaves as a static board game with fixed rents and values. To introduce strategic depth and establish the game's identity, we need to implement a dynamic economic engine where city-wide events shift neighborhood values, and interactive player modules enable property auctions and peer-to-peer asset negotiations.

## What Changes

- **Dynamic Event System**: Implement an event engine that triggers city-wide occurrences every few rounds (e.g., "Gargalo no Centro", "Copa do Mundo na Zona Sul") that alter rent modifiers, property values, and financial flows.
- **Interactive Auctions**: Enable a bidding system where properties declined by players or triggered by event cards are auctioned in real-time. All active players in the room can submit bids until a countdown timer expires.
- **Bilateral Trading**: Create a negotiation interface allowing players to propose asset trades (exchanging properties and/or cash) during their turns, enabling peer-to-peer deals.
- **Phaser Visualization**: Update the Phaser scene board renderer to visually display active event impacts (such as active rent multipliers) on the slot cards.
- **UI Dialog Additions**: Design Vuetify modal screens for entering bids during active auctions and managing trading requests.

## Capabilities

### New Capabilities

- `city-events`: Real-time system generating random events, applying multiplier modifiers to neighborhoods, and adjusting tax/financial flows.
- `property-auctions`: Server-side state machine running property bidding matches, processing bid updates, and applying time extensions.
- `player-trading`: Peer-to-peer trade system supporting proposal drafts, response states (accept, counter, decline), and database validation.

### Modified Capabilities

- `game-board`: Update the Phaser board scene to dynamically draw active rent multipliers and event warning badges on slot cards.
- `game-loop`: Update turn cycles to handle interruptions for bilateral trading phases and branching paths for property bidding lobbies.

## Impact

- **Database Expansions**: New database tables in Supabase (`auctions`, `active_trades`, `neighborhood_multipliers`).
- **Backend Services**: Addition of NestJS cron/timers for bidding countdown loops, and controller endpoints to validate trade deals.
- **Client store & UI**: Dynamic state handling in `gameStore.js` to manage trade proposal state machine, rendering of active auction screens in Vuetify overlays, and rendering of neon multipliers in Phaser slots.

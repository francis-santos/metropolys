## 1. Database Migrations and Event System Setup

- [ ] 1.1 Create SQL migrations in Supabase for `neighborhood_modifiers`, `auctions`, and `trades` tables
- [ ] 1.2 Implement round-counter service in NestJS that triggers random economic events (e.g. rent multiplier adjustments) every 5 rounds
- [ ] 1.3 Update server-side rent calculation logic to apply active neighborhood multipliers from `neighborhood_modifiers` table

## 2. Property Bidding and Auctions

- [ ] 2.1 Develop NestJS controllers to initialize property auctions when a player declines a property purchase
- [ ] 2.2 Implement server-side timer engine to handle the 30-second countdown and extend bidding window on late bids
- [ ] 2.3 Create Vuetify dialog modal in `MatchScreen.vue` to display active bids, remaining time, and submit new bids
- [ ] 2.4 Code server-side transition to close the auction, award property to the highest bidder, and deduct cash

## 3. Bilateral Player Trading (P2P)

- [ ] 3.1 Code NestJS REST endpoints to create, fetch, and resolve trade proposals (`POST /api/trades`, `POST /api/trades/:id/resolve`)
- [ ] 3.2 Implement backend asset validation inside a database transaction to verify property ownership before finalizing trade swaps
- [ ] 3.3 Create a sliding trading panel or modal in `MatchScreen.vue` to draft and submit trade offers (cash + property combinations)
- [ ] 3.4 Create an incoming trade popup modal for target players to accept or decline pending proposals

## 4. Visual Board Modifications (Phaser)

- [ ] 4.1 Refactor Phaser scene in `boardScene.js` to listen to realtime updates on `neighborhood_modifiers` table
- [ ] 4.2 Code Phaser graphics update routines to draw neon rent multiplier labels (e.g. "x1.5", "x2.0") on corresponding slot cards
- [ ] 4.3 Implement event notification alerts in Phaser (like displaying a banner at the top of the canvas during active events)

## 5. Manual Verification and Integration

- [ ] 5.1 Run multiplayer sessions to manually verify that bidding sniper extensions work correctly
- [ ] 5.2 Validate that concurrency guards prevent trade execution when assets change before trade acceptance

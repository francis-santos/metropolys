## ADDED Requirements

### Requirement: Real-time State Broadcasting
The game engine and database layer SHALL utilize Supabase Realtime Channels to broadcast game state events (position, balance, properties) to all connected clients immediately when updated.

#### Scenario: Sync active player movement
- **WHEN** the host rolls dice and updates the player's position in the database
- **THEN** Supabase Realtime SHALL push the new coordinates to all client browsers, and all clients SHALL animate the token movement in Phaser simultaneously

### Requirement: Chat/Event Logs Synchronization
The system SHALL synchronize match history logs in real-time between all active players.

#### Scenario: Sync turn event log
- **WHEN** player Alice buys a property, and the server inserts a log entry
- **THEN** the log entry SHALL be broadcasted in real-time, and Bob's sidebar logs feed SHALL update immediately

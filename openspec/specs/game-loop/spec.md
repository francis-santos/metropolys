# game-loop Specification

## Purpose
TBD - created by archiving change mvp1-board-and-base-game. Update Purpose after archive.
## Requirements
### Requirement: Match State and Resource Initialization
At the start of a match, the game engine SHALL initialize the match state: set active turn index to the first player, distribute the starting money (default: 1500) to all players, and set all property ownership to unowned.

#### Scenario: Starting a new local game
- **WHEN** the match is initialized with 2 players (Alice and Bob)
- **THEN** both Alice and Bob SHALL receive 1500 money, Alice SHALL be set as the active player, and all board slots SHALL be unowned

### Requirement: Turn Sequence and Movement
The match SHALL progress in turns. The active player MUST roll a 6-sided die (or simulated dice), move their token by that number of slots on the board, resolve actions on the landing slot, and then conclude their turn.

#### Scenario: Roll dice and move token
- **WHEN** Alice is the active player and triggers "Roll Dice", getting a score of 4
- **THEN** Alice's position SHALL advance by 4 slots, the action for the target slot SHALL be activated, and she SHALL be prompted to perform slot actions before ending her turn

### Requirement: Unowned Property Purchase
When a player lands on an unowned property slot, the game engine SHALL allow them to purchase the property for its listed cost, provided they have sufficient funds.

#### Scenario: Sells unowned property to landing player
- **WHEN** Alice lands on an unowned property named "Downtown A" costing 200, having a balance of 1500, and clicks "Buy Property"
- **THEN** Alice's balance SHALL become 1300, Alice SHALL be registered as the owner of "Downtown A", and the buy option SHALL be disabled

#### Scenario: Prevent purchase due to insufficient funds
- **WHEN** Bob lands on an unowned property named "Downtown B" costing 400, having a balance of 300
- **THEN** Bob SHALL NOT be permitted to buy the property, and the "Buy Property" action SHALL be disabled

### Requirement: Rent Collection on Owned Properties
When a player lands on a property owned by another player, the game engine SHALL automatically deduct the basic rent value of that property from the landing player's balance and add it to the owner's balance.

#### Scenario: Paying basic rent to owner
- **WHEN** Bob lands on "Downtown A" (owned by Alice, basic rent: 20), Bob having a balance of 1000 and Alice having 1300
- **THEN** Bob's balance SHALL become 980, and Alice's balance SHALL become 1320

### Requirement: Bankruptcy Handling
If a player's balance becomes negative, and they cannot satisfy an outstanding debt (such as rent), the game engine SHALL declare them bankrupt, mark them as inactive, and return all their owned properties to the unowned pool.

#### Scenario: Bankrupt player is eliminated
- **WHEN** Bob lands on Alice's property and owes 100 rent, but Bob's balance is only 40
- **THEN** Bob's balance SHALL drop to -60, Bob SHALL be flagged as bankrupt, all properties owned by Bob SHALL become unowned, and Bob SHALL be skipped in the turn rotation


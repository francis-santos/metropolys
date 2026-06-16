## MODIFIED Requirements

### Requirement: Match State and Resource Initialization
At the start of a match, the NestJS server SHALL initialize the database state: set active turn index to the lobby host, distribute the starting money (default: 1500) to all connected database players, and set all property ownership to unowned.

#### Scenario: Starting a new local game
- **WHEN** the lobby host starts the match with 2 players (Alice and Bob)
- **THEN** the server database records SHALL initialize both players with 1500 money, set Alice as active, set all properties to unowned, and broadcast the initialized match state

### Requirement: Turn Sequence and Movement
The match SHALL progress in turns. The active player MUST trigger a dice roll on the backend, which randomly generates the dice value, advances the player's position index in the database, and broadcasts the event to trigger client token animations.

#### Scenario: Roll dice and move token
- **WHEN** Alice is the active player and triggers the roll endpoint
- **THEN** the server SHALL generate the dice result, update Alice's database position, and broadcast the move to all clients, prompting them to animate and await resolution

### Requirement: Unowned Property Purchase
When a player lands on an unowned property slot, the server SHALL permit them to buy it, verify their balance, write the owner record to the database, deduct the cost, and broadcast the ownership update.

#### Scenario: Sells unowned property to landing player
- **WHEN** Alice lands on an unowned property named "Downtown A" costing 200, having a database balance of 1500, and clicks "Buy Property"
- **THEN** the server SHALL deduct 200 from Alice's database balance, assign Alice's ID as the owner of "Downtown A", and broadcast the update to all clients

#### Scenario: Prevent purchase due to insufficient funds
- **WHEN** Bob lands on an unowned property named "Downtown B" costing 400, having a database balance of 300
- **THEN** the server SHALL reject the purchase request, return a validation error, and maintain the property as unowned

### Requirement: Rent Collection on Owned Properties
When a player lands on a property owned by another player, the server SHALL automatically deduct the basic rent value from the landing player's database balance, add it to the owner's balance, and broadcast the updated financial state.

#### Scenario: Paying basic rent to owner
- **WHEN** Bob lands on "Downtown A" (owned by Alice, basic rent: 20), Bob having a database balance of 1000 and Alice having 1300
- **THEN** the server SHALL update Bob's balance to 980, Alice's balance to 1320, and broadcast the new balances to all clients

### Requirement: Bankruptcy Handling
If a player's database balance becomes negative, and they cannot satisfy an outstanding debt (such as rent), the server SHALL declare them bankrupt, flag them as inactive, set all their owned properties in the database to unowned, and skip them in future turn cycles.

#### Scenario: Bankrupt player is eliminated
- **WHEN** Bob lands on Alice's property and owes 100 rent, but Bob's database balance is only 40
- **THEN** Bob's balance SHALL be set to -60, the server SHALL mark Bob as bankrupt, release Bob's properties back to unowned in the database, and skip Bob in the turn rotation

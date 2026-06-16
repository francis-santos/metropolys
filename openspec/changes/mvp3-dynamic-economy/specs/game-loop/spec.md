## MODIFIED Requirements

### Requirement: Turn Sequence and Movement
The match SHALL progress in turns. The active player MUST trigger a dice roll on the backend, which randomly generates the dice value, advances the player's position index in the database, and broadcasts the event to trigger client token animations. The active player SHALL be allowed to initiate bilateral trade negotiations with opponent players before rolling or after completing movement.

#### Scenario: Roll dice and move token
- **WHEN** Alice is the active player and triggers the roll endpoint
- **THEN** the server SHALL generate the dice result, update Alice's database position, and broadcast the move to all clients, prompting them to animate and await resolution

### Requirement: Unowned Property Purchase
When a player lands on an unowned property slot, the server SHALL permit them to buy it, verify their balance, write the owner record to the database, deduct the cost, and broadcast the ownership update. If the active player declines the purchase or has insufficient funds, the server SHALL immediately transition the property into an Auction phase.

#### Scenario: Sells unowned property to landing player
- **WHEN** Alice lands on unowned property "Downtown A" costing 200, having a database balance of 1500, and clicks "Buy Property"
- **THEN** the server SHALL deduct 200 from Alice's database balance, assign Alice's ID as the owner of "Downtown A", and broadcast the update to all clients

#### Scenario: Transition to auction on decline
- **WHEN** Alice lands on unowned property "Downtown A" and clicks "Decline"
- **THEN** the server SHALL immediately freeze Alice's turn progress, trigger an Auction session, and open the bidding overlay for all active players in the room

## MODIFIED Requirements

### Requirement: Turn Sequence and Movement
The match SHALL progress in turns. The active player MUST trigger a dice roll on the backend, which randomly generates the dice value, advances the player's position index in the database, and broadcasts the event to trigger client token animations. If the active player is flagged as a bot, the turn sequence SHALL automatically trigger rolls, buy actions, and end-of-turn resolutions without human interaction.

#### Scenario: Roll dice and move token
- **WHEN** Alice is the active player and triggers the roll endpoint
- **THEN** the server SHALL generate the dice result, update Alice's database position, and broadcast the move to all clients, prompting them to animate and await resolution

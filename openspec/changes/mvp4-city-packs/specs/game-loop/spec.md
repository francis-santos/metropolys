## MODIFIED Requirements

### Requirement: Match State and Resource Initialization
At the start of a match, the server SHALL initialize the database state based on the loaded city pack parameters: set the active turn index, distribute the starting money specified by the city pack to all players, set all properties defined in the city pack to unowned, and load the custom event card deck registered for the active city.

#### Scenario: Starting a new local game
- **WHEN** the host starts the match for active city "LONDON"
- **THEN** both Alice and Bob SHALL receive the default starting money (e.g. 1500), Alice SHALL be set as the active player, all properties defined in the London city pack SHALL be set to unowned, and the London events deck (including cards like "Fog delay") SHALL be loaded into the active card pool

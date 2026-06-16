## ADDED Requirements

### Requirement: Active Turn Validation
The backend SHALL reject any game actions sent by clients that do not match the active player ID registered for the current turn.

#### Scenario: Reject dice roll from inactive player
- **WHEN** Bob (who is not active) sends a POST request to "/api/game/roll"
- **THEN** the NestJS server SHALL reject the request with a "403 Forbidden - Out of Turn" error and make no changes to the database state

### Requirement: Transaction and Purchase Validation
The server SHALL validate purchasing decisions by checking that the slot is unowned and that the requesting player has a cash balance greater than or equal to the property's cost.

#### Scenario: Reject purchase due to insufficient balance
- **WHEN** player Alice attempts to buy "Copacabana A" (costing 200) but her server-side balance is only 150
- **THEN** the server SHALL return a validation error, reject the purchase transaction, and maintain the slot as unowned

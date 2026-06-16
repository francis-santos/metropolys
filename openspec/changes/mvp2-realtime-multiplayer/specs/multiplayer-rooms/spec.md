## ADDED Requirements

### Requirement: Room Creation and Lobby
The backend system SHALL support the creation of unique multiplayer game rooms, generating a short code for access.

#### Scenario: Host creates multiplayer room
- **WHEN** the host player clicks "Criar Sala"
- **THEN** the server SHALL create a room record in the database, generate a unique 6-character room code, add the host to the players list, and return the room code to the client

### Requirement: Lobby Connection and Joining
Players SHALL be able to join an active lobby using a valid room code.

#### Scenario: Guest joins lobby successfully
- **WHEN** a guest player enters a valid 6-character room code and clicks "Entrar"
- **THEN** the system SHALL insert the player into the room's database record and broadcast the updated lobby player list to all connected clients in the room

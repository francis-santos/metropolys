## ADDED Requirements

### Requirement: Random Event Generation
The backend engine SHALL generate a city-wide economic event card at the start of every 5th game round, applying modifier parameters to players, taxes, or specific neighborhoods.

#### Scenario: City event card activates
- **WHEN** round 5 begins, and the server draws a "Gargalo no Centro" event
- **THEN** the server SHALL set the rent multiplier for neighborhood "Zona Central" to 2.0, reduce rent multiplier for other neighborhoods to 0.8, and broadcast the event details to all clients

### Requirement: Neighborhood Multiplier Application
The game loop SHALL apply any active neighborhood multiplier to rent calculations when landing on owned properties.

#### Scenario: Apply active multiplier to rent transaction
- **WHEN** Alice lands on Bob's property "Avenida Paulista A" (base rent: 12), while "Zona Central" has a 2.0 multiplier active
- **THEN** Alice's balance SHALL be deducted by 24 (12 * 2.0) and credited to Bob, logging the event multiplier calculation

## ADDED Requirements

### Requirement: Personality-driven Decision Loop
AI bot players SHALL automatically process their gameplay decisions (rolls, property purchases, bidding thresholds) based on their assigned personality profile (Aggressive, Conservative, Balanced).

#### Scenario: Aggressive bot buys property
- **WHEN** it is the turn of bot player Bob (Aggressive), who lands on unowned property "Paulista A" costing 200, having a balance of 300
- **THEN** the system SHALL automatically purchase the property, deducting 200, and logging the automated transaction

#### Scenario: Conservative bot declines property
- **WHEN** it is the turn of bot player Carlos (Conservative), who lands on unowned property "Savassi D" costing 400, having a balance of 450
- **THEN** the system SHALL automatically decline the purchase to maintain a cash cushion, initiating a public property auction

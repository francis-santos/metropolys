## MODIFIED Requirements

### Requirement: Phaser Canvas Integration and Board Map Layout
The game board SHALL be rendered using the Phaser game engine in a designated canvas area on the Match screen, loading a static layout representing a single test city. The board renderer SHALL dynamically display neighborhood rent multipliers and active event warning icons on the slot cards in real-time.

#### Scenario: Canvas initialization and board layout load
- **WHEN** the Match screen loads
- **THEN** the Phaser canvas SHALL initialize and render the test city board map containing a path of slots (Start slot, properties grouped by neighborhood, and special slots) and draw visual indicators showing any active rent multipliers (e.g. "x1.5", "x2.0") on the corresponding slot cards

## MODIFIED Requirements

### Requirement: Phaser Canvas Integration and Board Map Layout
The game board SHALL be rendered using the Phaser game engine in a designated canvas area on the Match screen. The layout (slot coordinates, slot count, names, neighborhood associations, and color codes) SHALL be loaded and drawn dynamically according to the active city pack configuration.

#### Scenario: Canvas initialization and board layout load
- **WHEN** the Match screen loads
- **THEN** the Phaser canvas SHALL initialize, parse the active city's board slots configuration, render the dynamically structured path of slots, and draw custom neighborhood themes and names

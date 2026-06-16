## ADDED Requirements

### Requirement: City Selection Screen
The game flow SHALL introduce a City Selection screen where players can manually choose a city pack or trigger a random selection.

#### Scenario: Manually select a city pack
- **WHEN** the lobby host selects the "Europa Pack - Londres" card and clicks "Selecionar"
- **THEN** the system SHALL set the active room city code to "LONDON", update lobby aesthetics to London's theme, and advance to player configuration

#### Scenario: Randomly select a city pack
- **WHEN** the lobby host clicks "Escolha Aleatória"
- **THEN** the system SHALL randomly pick one city code from the registered packs array (e.g., "SAO-PAULO" or "LONDON") and set it as the active city

## ADDED Requirements

### Requirement: City Pack Schema Validation
The city pack loader SHALL fetch and parse city configuration modules (JSON/JS), validating that they contain metadata, coordinate layouts, neighborhood colors, pricing models, and event decks.

#### Scenario: Successfully load city configuration
- **WHEN** the match starts with active city "SAO-PAULO"
- **THEN** the system SHALL load the `sao-paulo.json` configuration, register the neighborhood colors, extract the property coordinates for the Phaser engine, and verify that all 20 slot objects conform to the board format schema

### Requirement: Theme and Style Injection
The system SHALL inject styling variables (primary/secondary color codes, background gradient classes, text font sizes) from the loaded city configuration into the Vue/Vuetify theme registry.

#### Scenario: Apply London theme styling
- **WHEN** a match is initialized for "LONDON"
- **THEN** the client application SHALL update its CSS variables to match London's custom palette (e.g. Red, Blue, Grey accents) and set the title bar subtitle to "Londres"

## Why

Currently, Project Metropolys only supports a single hardcoded board layout. To achieve the main product differentiator—reusability and extensibility via custom expansions—we need to implement a dynamic city selection screen and modular city pack architecture that injects custom boards, themes, and event decks at match initialization.

## What Changes

- **City Selection Screen**: Implement a `CitySelectionScreen` between Home and Match, allowing players to select their city of choice (or choose a random one).
- **Modular Directory (`citypacks`)**: Set up a structured configurations registry containing metadata, board slot coords, neighborhood styles, and custom event decks for at least two test cities (e.g., "São Paulo" from South America Pack, and "London" from Europe Pack).
- **Dynamic Board Injector**: Refactor the Phaser canvas scene to build slot nodes dynamically from the coordinates and parameters supplied by the selected city pack instead of importing a static module.
- **Visual Theme Customization**: Dynamically update client UI variables (background colors, gradients, font parameters, token color schemes) based on the selected city's configuration.
- **Custom Event Decks**: Support city-specific event cards (e.g., "Transit Congestion" in São Paulo or "Thick Fog" in London) that are loaded into the server-side event engine.

## Capabilities

### New Capabilities

- `city-selection`: UI wizard allowing hosts to select from available city packs or choose randomly, saving the selection to the room state.
- `city-pack-loader`: Service that parses city JSON configs, validates coordinates and neighborhoods, and outputs the board properties to the game store and engine.

### Modified Capabilities

- `game-board`: Update Phaser scene to render board layouts, colors, and node paths dynamically according to the loaded city config object instead of relying on a hardcoded asset.
- `game-loop`: Update match initialization to load properties, rent metrics, and custom card pools dynamically based on the selected city's ID.

## Impact

- **Configuration Management**: Introduction of the `src/game/citypacks` directory hosting JSON/JS files for city definitions (e.g. `sao-paulo.json`, `london.json`).
- **Database Schema**: Add a `city_code` field to the `rooms` table.
- **Lobby Integration**: Match creation endpoint updated to receive and validate the chosen city code.

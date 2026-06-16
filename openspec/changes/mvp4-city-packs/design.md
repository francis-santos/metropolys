## Context

In MVP 1-3, all game assets and loops were based on a single hardcoded board configurations file. In MVP 4, we generalize the game engine to treat the city as an expansion pack. We will set up a modular registry inside `src/game/citypacks/` and implement a dynamic loader that updates client interfaces and Phaser canvas vectors on match initialization.

## Goals / Non-Goals

**Goals:**
- Design a structured JSON configuration schema for city packs.
- Implement the `CitySelectionScreen` UI using Vuetify components, supporting manual and random selections.
- Create two fully configured city packs: "São Paulo" (South America Pack) and "London" (Europe Pack).
- Build a City Pack Loader service to validate, import, and serve configuration details to the frontend and backend.
- Refactor Phaser `BoardScene` to query properties list and coordinates dynamically from the active city config.
- Refactor the backend NestJS room model to accept and register a `cityCode` field.

**Non-Goals:**
- Dynamic remote file downloads (City packs are compiled locally inside the build bundle at this phase).
- Custom board dimensions (all boards must fit the 1600x900 coordinate window and maintain a 20-slot track for game-loop integrity).

## Decisions

### 1. City Configuration JSON Schema
Each city expansion will be defined by a JSON file under `src/game/citypacks/` matching the following schema:
```json
{
  "id": "sao-paulo",
  "name": "São Paulo",
  "packName": "América do Sul Pack",
  "startingCapital": 1500,
  "theme": {
    "primary": "#10B981",
    "secondary": "#F59E0B",
    "background": "#022C22"
  },
  "slots": [
    { "id": 0, "name": "Partida (Start)", "type": "START", "x": 200, "y": 100, "color": "#10B981" },
    { "id": 1, "name": "Avenida Paulista", "type": "PROPERTY", "cost": 150, "rent": 15, "x": 440, "y": 100, "color": "#EF4444" }
    // 20 slots ...
  ],
  "events": [
    { "text": "Trânsito caótico na Marginal Pinheiros. Pague 80", "amount": -80 },
    { "text": "Virada Cultural atrai turistas. Receba +150", "amount": 150 }
  ]
}
```

### 2. Vite Static Bundle Registry
- **Decision**: We will register city packs inside an index exporter file `src/game/citypacks/index.js` importing the JSON configurations statically.
- **Rationale**: Statically importing the assets ensures they are bundled correctly during compilation, avoids async file reading errors, and is fully compatible with standard Webpack/Vite setups.
- **Alternatives considered**: Async REST fetch of JSON files. Unnecessary at this stage since packs are built-in, and static index imports prevent 404 resource errors.

### 3. Dynamic Styling variables injection
- **Decision**: We will store the active city's theme settings inside `gameStore.activeCityConfig.theme` and bind them to HTML elements using Vue inline styles or CSS Custom Properties (e.g. `:style="{ '--primary': store.activeCityConfig.theme.primary }"`).
- **Rationale**: Decoupled from Vuetify globals, this allows easy local component overrides and smooth transition animations when switching themes in the lobby.

## Risks / Trade-offs

- **Risk**: Mismatched coordinate formats or uneven track links causing Phaser rendering bugs.
  - **Mitigation**: Implement a schema validation step in the City Loader service to check slot coordinates and verify they exist before initializing the canvas.

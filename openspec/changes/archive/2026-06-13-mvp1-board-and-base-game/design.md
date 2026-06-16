## Context

This project initializes the frontend architecture for Project Metropolys. We need to create a responsive, high-performance web dashboard combining standard UI components (Vue 3, Vuetify) with a high-performance 2D canvas engine (Phaser 3). At this stage, all state is local to the user's browser, enabling local multiplayer (hotseat) for 2 to 4 players.

## Goals / Non-Goals

**Goals:**
- Set up a monorepo structure using npm/pnpm workspaces, locating the frontend client under `apps/web` (Vue 3, Vite, and Vuetify 3) and leaving space for `apps/api` (NestJS) in subsequent phases.
- Integrate the Phaser 3 engine inside a Vue component, ensuring proper canvas scaling at an internal resolution of 1600x900, with correct resizing and lifecycle teardown.
- Implement a centralized, reactive game state store (using Pinia or reactive Vue state) that holds player names, turn cycles, balances, properties, token positions, and log messages.
- Render a static board path representing a single test city in Phaser using procedural geometric drawings (colored shapes, lines, and text), grouping properties into colored neighborhoods.
- Implement standard game logic: rolling a 6-sided die, step-by-step token movement animations, property purchases, rent transactions, and basic bankruptcy elimination.
- Create beautiful, responsive dashboards using Vuetify components for navigation, player setup, logs, and action panels.

**Non-Goals:**
- NestJS backend APIs or Supabase DB storage (all data is transient in memory; backend structures are out of scope for this MVP).
- Network-based multiplayer (only hotseat/local play is supported).
- Advanced trading, auction systems, mortgages, or AI/NPC bots.
- Production-grade external artwork assets (all board details, slots, and tokens will be drawn procedurally/geometrically using Phaser's graphics API).

## Decisions

### 1. Centralized State Store for Vue and Phaser Integration
- **Decision**: We will use a reactive JavaScript store (e.g., standard Vue 3 `reactive` store or `Pinia`) as the single source of truth.
- **Rationale**: Vue needs to render overlays (menus, money bars, log lists) reactively, while Phaser needs to render token positions and animate transitions. By keeping the core state in a pure JavaScript store, Vue can observe it reactively, and Phaser scenes can access it directly during updates or event callbacks.
- **Alternatives considered**:
  - *State in Phaser*: Makes building Vue UIs difficult, as Vue would need to poll or hook into Phaser's internal registry.
  - *State in Vue Components*: Phaser would not have easy access to the data, resulting in tight parent-child coupling.

### 2. Phaser Canvas as a Visual Render-only View
- **Decision**: Phaser will act as an engine for drawing the board, displaying token sprites, and animating movement. The actual game rules (e.g., validating player balances, calculating rent, advancing turns) will be executed in the JS/TS store layer.
- **Rationale**: Separating game logic from rendering makes the engine highly testable and keeps Phaser light. When the store updates (e.g. player moves), it triggers an event that Phaser listens to in order to run a movement animation.
- **Alternatives considered**: Writing the state machine directly in Phaser scenes. This mixes UI/game logic and makes it harder to migrate to multiplayer/backend synchronization in future MVPs.

### 3. Board Geometry and Path Modeling (1600 x 900 Resolution)
- **Decision**: Model the board in a configurations file (`board-data.js`) as an ordered array of slot nodes, using an internal fixed coordinate system of 1600 x 900. All board visual representation (slots, borders, texts, player tokens) will be drawn dynamically using Phaser graphics drawing functions (`Phaser.GameObjects.Graphics`).
- **Rationale**: A fixed internal resolution of 1600x900 ensures predictable alignment of all visual nodes. Phaser's built-in Scale manager will fit this canvas responsive to any display layout. Drawing the board procedurally/geometrically eliminates the need for downloading external image assets and keeps build bundles small.

## Risks / Trade-offs

- **Risk**: Out-of-sync state between Phaser animations and Vue UI displays (e.g., a player sees their cash drop in the Vue sidebar before the token finishes animating to the property).
  - **Mitigation**: Introduce state flags in the store (e.g., `isAnimating: true`). The Vue UI will disable action buttons while an animation is in progress and wait for Phaser to signal animation completion before enabling the next turn action.
- **Risk**: Canvas scaling on different screen resolutions.
  - **Mitigation**: Configure Phaser with `Phaser.Scale.FIT` mode inside a flexbox container, allowing it to scale automatically to fit 1600x900 aspect ratio, paired with scrollable Vuetify side panels.


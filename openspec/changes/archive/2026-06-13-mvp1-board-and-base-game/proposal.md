## Why

This change initiates the development of Project Metropolys by establishing MVP 1: Board Foundations and Base Game. It sets up the core frontend framework (Vue 3, Vuetify, and Phaser) and builds a playable local (hotseat) prototype to validate the basic game mechanics—turn sequence, movement, property purchase, and rent collection—without backend or network dependencies.

## What Changes

- **Frontend Stack Initialization**: Set up a Vue 3 project with Vuetify integration for UI layouts and screens, and integrate the Phaser game engine for rendering the interactive game board.
- **Main App Screens**: Implement `Home`, `Match` (Partida), and `Settings` screens using Vuetify components.
- **Interactive Game Board (Phaser)**: Generate and render a static game board of a test city (e.g., representation of neighborhoods, streets, property slots) using Phaser.
- **Local Game Logic**:
  - Distribute initial capital/resources to players at the start of the game.
  - Implement a turn-based state machine for hotseat play.
  - Support rolling dice and moving player tokens along the board slots.
  - Support purchasing unoccupied property slots.
  - Implement basic rent collection when landing on properties owned by other players.

## Capabilities

### New Capabilities

- `game-screens`: UI screens (Home, Match, Settings) with navigation, player setup form, and basic options.
- `game-board`: Board renderer using Phaser, displaying the slots and neighborhoods of a test city and rendering moving player tokens.
- `game-loop`: Engine for local match state management: turn cycles, dice-rolling, property ownership registry, resource distribution, and rent calculation.

### Modified Capabilities

*None (initial implementation).*

## Impact

- **New Client Application**: Introduction of the frontend workspace/app under a new directory (e.g., `apps/web` or root-level frontend skeleton).
- **Frontend Dependencies**: Addition of `vue`, `vuetify`, `phaser`, and related build tools (`vite`).
- **No Backend Impact**: The backend (NestJS/Supabase) is intentionally excluded in this MVP; all state is local to the client browser session.

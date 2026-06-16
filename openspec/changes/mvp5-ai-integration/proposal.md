## Why

Currently, Project Metropolys relies on static economic rules and human-only matchmaking. To transform matches into living, narrative-driven economic simulations, we need to integrate an Artificial Intelligence module that manages intelligent bot players, generates dynamic context-aware events, compiles session narrations, and acts as an intelligent banker.

## What Changes

- **AI Bot Opponents**: Implement server-side bot agents with distinct strategic personalities (e.g., Aggressive, Conservative, Pragmatic) that can fill empty slots in lobbies and make gameplay decisions.
- **AI Game Master (Dynamic Events)**: Integrate an LLM agent that evaluates active board conditions (e.g., rich/poor gaps, neighborhood saturation) to generate context-sensitive city events and custom rent multipliers.
- **AI Match Narrator**: Generate a dynamic news feed that contextualizes transactions, property acquisitions, and player actions in a rich narrative tone.
- **AI Intelligent Banking**: Allow the server-side banker to analyze cash flow and offer custom, context-appropriate loans or property buyout proposals to struggling players.
- **Narrative Log Overlay**: Update the Match Screen UI to display a glowing "Diário da Metrópole" narrative log board.

## Capabilities

### New Capabilities

- `ai-bot-players`: State manager and LLM prompt loop resolving bot decisions (rolling, property buying, bidding in auctions, accepting/declining trades).
- `ai-game-master`: Service that analyzes database rows, formats prompt payloads, calls the LLM API, and updates rent modifiers and city conditions.
- `ai-match-narrator`: Narrative engine that compiles player moves into newspaper logs or contextual summaries.

### Modified Capabilities

- `game-loop`: Update turn progression to execute bot actions and block loops while awaiting AI banking resolutions or Game Master event draws.

## Impact

- **API Integrations**: Configure LLM client libraries (such as Gemini API or OpenAI SDK) inside NestJS `apps/api`.
- **Database Schema**: New database tables in Supabase (`ai_narratives`, `bot_personalities`, `bank_offers`).
- **Client Logs Layout**: Expand `MatchScreen.vue` to render AI news logs and floating banker notification cards.

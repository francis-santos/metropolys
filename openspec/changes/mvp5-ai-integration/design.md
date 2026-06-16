## Context

In MVP 4, we completed the modular city packs. For MVP 5, we transition the application into an AI-driven economic simulation. We will integrate a Generative AI API client inside NestJS, implement prompt loops to control automated bot players, evaluate board contexts to spawn dynamic event modifications, and generate localized narrative logs.

## Goals / Non-Goals

**Goals:**
- Integrate the Google Gemini API (`@google/generative-ai` SDK) inside NestJS `apps/api`.
- Implement a server-side AI Bot service that triggers prompt decisions (roll, buy, bid, trade responses) based on bot personality descriptors.
- Implement an AI Game Master scheduler that triggers every 5 rounds to evaluate room statistics and inject a dynamic economic event with multipliers.
- Implement an AI Narrator service that parses game milestones and creates newspaper-style log text entries.
- Create a narrative newspaper block UI in `MatchScreen.vue` and display typing indicators for bots.

**Non-Goals:**
- Voice synthesis / narration audio (logs are displayed in textual format only).
- Advanced learning bots (the AI bots are stateless prompt-response agents; they do not train neural networks during play).

## Decisions

### 1. Gemini API Client Integration
- **Decision**: We will configure a NestJS `AiService` importing the `@google/generative-ai` SDK, loading credentials via environment variables (`GEMINI_API_KEY`).
- **Rationale**: Gemini provides low-latency JSON schema response parsing (`responseSchema` configurations) which is critical for converting LLM outputs directly into clean system instructions.
- **API Fallback**: If the API key is not configured or fails, the service will fall back to a local rule-based deterministic bot resolver to prevent game loop locks.

### 2. Structured Bot Prompts (JSON Output)
- **Decision**: Bot decisions will be resolved by passing the current board state and player wealth as a JSON payload to the Gemini API with instructions to return a strictly structured JSON response.
- **Prompt Schema Example**:
```typescript
const systemPrompt = `Você é um investidor imobiliário no jogo Metropolys com a personalidade: ${personality}.
Com base no saldo atual, posição dos adversários e propriedades disponíveis, tome uma decisão de ação.
Você deve responder estritamente no formato JSON: { "action": "BUY" | "PASS", "rationale": "Breve justificativa" }`;
```

### 3. Database Schema Expansions
We will add three tables to support AI logs and parameters:
- **`ai_news`**:
  - `id` (uuid, primary key)
  - `room_id` (uuid, foreign key -> rooms.id)
  - `headline` (text, AI generated title)
  - `body` (text, AI generated story)
  - `created_at` (timestamp)
- **`bot_actions`**:
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key -> players.id)
  - `decision_json` (jsonb, containing choice and rationale)

## Risks / Trade-offs

- **Risk**: High API latency causing slow bot turns.
  - **Mitigation**: Pre-trigger bot decisions in the background while client token movement animations are running, showing a "Pensando jogada..." status card in the Vue interface.
- **Risk**: API cost and rate limits.
  - **Mitigation**: Cache static board details, limit narrative generations to high-impact events (purchases, bank loans, bankruptcy, city events), and use a lightweight model (e.g. `gemini-2.5-flash`).

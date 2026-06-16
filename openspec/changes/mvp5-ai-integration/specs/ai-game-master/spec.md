## ADDED Requirements

### Requirement: AI Context Evaluation and Event Generation
The AI Game Master service SHALL evaluate active match statistics (cash margins, properties distribution) and query the configured LLM API to generate a contextually appropriate economic event.

#### Scenario: Generate AI economic bailout event
- **WHEN** the match completes round 10, with 3 players bankrupt and only Alice remaining with low cash
- **THEN** the AI Game Master SHALL prompt the LLM to generate an event (e.g., "Pacote de Estímulo Governamental" crediting 300 to Alice) and broadcast the multipliers and descriptions to the database

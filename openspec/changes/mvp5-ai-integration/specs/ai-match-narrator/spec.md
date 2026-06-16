## ADDED Requirements

### Requirement: AI Log Narrative Summaries
The AI Match Narrator SHALL compile transaction milestones and generate customized news headlines or journal records using a journalistic city-focused tone.

#### Scenario: Generate narrative summary of property acquisition
- **WHEN** player Alice purchases the premium "Copacabana D" property
- **THEN** the server SHALL query the LLM to generate a headline (e.g., "MOGUL DO MAR: Alice adquire a prestigiosa orla de Copacabana D em transação histórica") and append it to the room's narrative logs database table

## 1. Gemini API Integration and Configurations

- [ ] 1.1 Install the `@google/generative-ai` client library inside NestJS backend (`apps/api`)
- [ ] 1.2 Implement SQL database migrations in Supabase to create the `ai_news` table
- [ ] 1.3 Implement NestJS configurations module mapping the `GEMINI_API_KEY` credential

## 2. Automated AI Bot Players

- [ ] 2.1 Develop NestJS prompt builder payload compiling player standings, available cash, and active bot personality
- [ ] 2.2 Create automated AI bot turn resolver in NestJS executing automated rolls, purchases, and end-of-turn actions
- [ ] 2.3 Add "Pensando..." visual status indicators to the player cards in `MatchScreen.vue` when active player is a bot
- [ ] 2.4 Code local deterministic fallback rules in NestJS Bot service for execution when API keys are missing

## 3. AI Game Master and Narrative Logs

- [ ] 3.1 Implement NestJS Game Master cron/interval evaluator triggering LLM calls to generate city events every 5 rounds
- [ ] 3.2 Implement AI Narrator service to prompt LLM for news headlines upon high-impact transactions (acquisitions, bankruptcy)
- [ ] 3.3 Create a "Diário da Metrópole" narrative drawer section in `MatchScreen.vue` to render AI news logs

## 4. Verification and Manual Checks

- [ ] 4.1 Launch lobby adding 1 human player and 2 AI bots, manually verifying match loops and automated choices
- [ ] 4.2 Verify that rate-limiting fallback overrides function correctly when API limits are exceeded

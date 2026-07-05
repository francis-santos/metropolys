# Diretrizes Globais do Projeto Metropolys (Fonte de Verdade)

Todos os agentes de IA operando neste projeto (incluindo o time de especialistas: Arquiteto, Dev Senior, DBA, QA e Orquestrador) devem seguir estritamente as regras abaixo, que se sobrepõem a conceitos genéricos:

## Arquitetura e Código
1. O backend é construído em **NestJS** (usando as melhores práticas do framework).
2. O frontend é construído em **Vue 3** com Composition API e script setup macros.
3. O núcleo do motor do jogo (Game Engine) é baseado na arquitetura de **20 agentes independentes** (Infra, Rules Engine, Turn Manager, etc.) operando via eventos.
4. Qualquer implementação de regras de tabuleiro deve passar pela camada de agentes antes de refletir na UI.
5. Os testes End-to-End são feitos usando **Playwright**, com a configuração rodando ambos os servidores via `concurrently`.

## Colaboração entre Agentes
- Todos os membros do time DEV (QA, Arquiteto, etc.) **devem interagir obrigatoriamente** com os 20 agentes internos de arquitetura do jogo via CLI (`npm run agent:*`) para validar regras.
- O Agente de QA deve se integrar ativamente com a skill `metropolys-qa` para aliar validação de UI com o estado interno.
- Nenhuma decisão arquitetural deve quebrar a independência dos 20 agentes do tabuleiro.

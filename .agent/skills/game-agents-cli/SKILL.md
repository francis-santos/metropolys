---
name: game-agents-cli
description: Dicionário de comandos CLI do Metropolys. Use para simular, testar e forçar estados nos 20 agentes internos de backend do jogo.
---

# 🎮 Game Agents CLI (Comandos do Motor)

Esta skill consolida o acesso aos **20 agentes da arquitetura do jogo Metropolys**. Em vez de carregar milhares de linhas de contexto, você só precisa olhar a lista abaixo e rodar o comando correspondente para interagir com o backend via terminal.

## Lista de Comandos (`npm run agent:*`)

- `agent:infra` - Camada de rede e persistência.
- `agent:data-persistence` - Snapshots e BD.
- `agent:game-engine` - Núcleo processador.
- `agent:rules-engine` - Validação rígida.
- `agent:turn-manager` - Rodadas e turnos.
- `agent:physics` - Física de dados e UI.
- `agent:event-dispatcher` - Barramento.
- `agent:ai-opponent` - Comportamentos de bots.
- `agent:balancing` - Economia do jogo.
- `agent:analytics` - Logs e métricas.
- `agent:board-state` - Posições e donos.
- `agent:card-asset` - Inventário.
- `agent:rule-validator` - Pré-checagem.
- `agent:ui-ux` - Envio para o frontend.
- `agent:input` - Entrada do usuário.
- `agent:notification` - Eventos de aviso.
- `agent:player-profile` - Dados dos players.
- `agent:matchmaking` - Busca de partidas.
- `agent:community` - Lado social.
- `agent:human-player` - Simulador de ação humana.

### Orquestrador
- `agent:orchestrator` - Pode rodar ações macros como `detect`, `repair`, `consistency`, `metrics`, `recover` e `simulate [N]`.

**Como usar:** Basta rodar `npm run agent:<nome> <comando (info/status/test/run)>` no terminal para executar.

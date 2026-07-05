---
name: board-agents
description: Executa e simula a cadeia de 20 agentes da arquitetura do jogo Metropolys. Permite rastrear eventos através das 6 camadas do sistema diretamente no chat ou via terminal CLI.
---

# Board Game Agents Architecture (Metropolys)

Este diretório contém a modelagem de 20 agentes divididos em 6 camadas lógicas, desde a infraestrutura de baixo nível até o jogador humano final. Eles operam em um ecossistema orientado a eventos para orquestrar e simular partidas do jogo de tabuleiro *Metropolys*.

## Estrutura da Cadeia de Agentes

Os 20 agentes são distribuídos em 6 camadas com responsabilidades claras:

```
  +-------------------------------------------------------------+
  |                   Camada 6: Social & Usuário                 |
  | [Human Player]   [Player Profile]   [Matchmaking]   [Community] |
  +------------------------------+------------------------------+
                                 | (Input / Actions)
                                 v
  +-------------------------------------------------------------+
  |                 Camada 5: Interação (Interface)             |
  |       [Input Agent]       [UI/UX Agent]   [Notification]    |
  +------------------------------+------------------------------+
                                 | (Events & Rendering)
                                 v
  +-------------------------------------------------------------+
  |                  Camada 4: Gameplay (Recursos)              |
  |     [Board State]     [Card / Asset]      [Rule Validator]   |
  +------------------------------+------------------------------+
                                 | (Validation & Sync)
                                 v
  +-------------------------------------------------------------+
  |                  Camada 3: Serviços (Lógica)                |
  |   [Turn Manager]   [Rules Engine]   [Physics / Sim]   [Event Disp] |
  +------------------------------+------------------------------+
                                 | (Execution / Probabilities)
                                 v
  +-------------------------------------------------------------+
  |                     Camada 2: Inteligência                  |
  |       [AI Opponent]      [Balancing]      [Analytics]       |
  +------------------------------+------------------------------+
                                 | (Decisions / Tuning)
                                 v
  +-------------------------------------------------------------+
  |                     Camada 1: Arquitetura                   |
  |         [Infra Agent]         [Data Persistence Agent]       |
  |                       [Game Engine Agent]                   |
  +-------------------------------------------------------------+
```

---

## Mapeamento de Responsabilidades dos Agentes

### 🧠 Camada 1: Arquitetura (Fundação do Sistema)
1. **Infra Agent (Agente de Infraestrutura)**
   - *ID*: `infra-agent`
   - *Papel*: Monitora a saúde do servidor, latência de rede simulada e conexões.
2. **Data Persistence Agent (Agente de Persistência de Dados)**
   - *ID*: `data-persistence-agent`
   - *Papel*: Carrega e salva estados do jogo, registrando históricos no arquivo `database.json`.
3. **Game Engine Agent (Agente de Motor do Jogo)**
   - *ID*: `game-engine-agent`
   - *Papel*: Executa as alterações físicas de estado como movimentação das peças, compras no banco e transações de ativos.

### ⚙️ Camada 2: Lógica & Serviços (Orquestração)
4. **Rules Engine Agent (Agente de Regras)**
   - *ID*: `rules-engine-agent`
   - *Papel*: Aplica as regras macro do jogo de tabuleiro (como cálculo de aluguéis e bônus de bairros).
5. **Turn Manager Agent (Agente de Turnos)**
   - *ID*: `turn-manager-agent`
   - *Papel*: Orquestra a ordem de turnos dos jogadores, mudando as fases do jogo e incrementando rodadas.
6. **Physics / Simulation Agent (Agente de Simulação)**
   - *ID*: `physics-agent`
   - *Papel*: Simula efeitos probabilísticos ou físicos, como rolagem de dados e sorteio de cartas de evento.
7. **Event Dispatcher Agent (Agente de Eventos)**
   - *ID*: `event-dispatcher-agent`
   - *Papel*: Encaminha as mensagens entre os agentes por meio de subscrições.

### 🤖 Camada 3: Inteligência
8. **AI Opponent Agent (Agente de Oponentes IA)**
   - *ID*: `ai-opponent-agent`
   - *Papel*: Gera decisões autônomas para bots baseado em suas personalidades (Ex: AGGRESSIVE, CONSERVATIVE, BALANCED).
9. **Balancing Agent (Agente de Balanceamento)**
   - *ID*: `balancing-agent`
   - *Papel*: Monitora a paridade financeira dos jogadores e pode injetar pequenos modificadores ou eventos de ajuda financeira.
10. **Analytics Agent (Agente de Análise)**
    - *ID*: `analytics-agent`
    - *Papel*: Coleta telemetria e KPIs da partida, calculando estatísticas como média de dados e taxa de aquisição imobiliária.

### 🎮 Camada 4: Gameplay (Recursos)
11. **Board State Agent (Agente de Estado do Tabuleiro)**
    - *ID*: `board-state-agent`
    - *Papel*: Provê uma representação em tempo real das posições e posses das casas do tabuleiro.
12. **Card / Asset Agent (Agente de Recursos do Jogo)**
    - *ID*: `card-asset-agent`
    - *Papel*: Gerencia o deck de cartas e as posses individuais de cartas especiais.
13. **Rule Validator Agent (Agente de Validação de Ação)**
    - *ID*: `rule-validator-agent`
    - *Papel*: Valida se uma ação proposta viola regras estruturais imediatas (ex: saldo devedor, posse duplicada).

### 🧑 Camada 5: Interação (Interface)
14. **UI/UX Agent (Agente de Interface)**
    - *ID*: `ui-ux-agent`
    - *Papel*: Transmite coordenadas de renderização, gatilhos de som e solicitações de animação.
15. **Input Agent (Agente de Entrada)**
    - *ID*: `input-agent`
    - *Papel*: Recebe comandos vindo de usuários físicos ou disparados em fila e inicia a cadeia.
16. **Notification Agent (Agente de Comunicação)**
    - *ID*: `notification-agent`
    - *Papel*: Cospe mensagens formatadas para log legível a humanos sobre o desenrolar das jogadas.

### 👥 Camada 6: Social & Usuário Final
17. **Player Profile Agent (Agente de Perfil do Jogador)**
    - *ID*: `player-profile-agent`
    - *Papel*: Gerencia histórico de partidas locais, vitórias/derrotas, cores de pin e estatísticas de perfil.
18. **Matchmaking Agent (Agente de Pareamento)**
    - *ID*: `matchmaking-agent`
    - *Papel*: Simula o lobby de pareamento de salas, checando se a sala está pronta e tem jogadores suficientes.
19. **Community Agent (Agente de Comunidade)**
    - *ID*: `community-agent`
    - *Papel*: Simula reações no chat da partida e atualizações de ranking global dos jogadores.
20. **Human Player Agent (Agente Jogador Humano)**
    - *ID*: `human-player-agent`
    - *Papel*: Representa a decisão estratégica de um jogador humano (aguarda decisões).

---

## Game Sovereign Agent (Orquestrador) e CLI

A arquitetura agora conta com um cérebro central, o **Game Sovereign Agent (GSA)** (`orchestrator.js`), que gerencia e supervisiona os 20 agentes. Além disso, cada agente foi separado em seu próprio arquivo executável.

### 1. Comandos do Orquestrador (GSA)

A partir da raiz do projeto, execute o orquestrador (ou o wrapper `board-agents.js`) para acessar as ferramentas do GSA:

```bash
# Diagnóstico e Reparo
node .agent/skills/board-agents/scripts/orchestrator.js detect       # Detecta bugs e inconsistências
node .agent/skills/board-agents/scripts/orchestrator.js repair       # Aplica correções automáticas
node .agent/skills/board-agents/scripts/orchestrator.js consistency  # Verifica a integridade do estado

# Coordenação e Análise
node .agent/skills/board-agents/scripts/orchestrator.js coordinate   # Mostra mapa de dependências e eventos
node .agent/skills/board-agents/scripts/orchestrator.js ux-report    # Gera relatório de UX Intelligence
node .agent/skills/board-agents/scripts/orchestrator.js metrics      # Mostra métricas de uso e erros dos agentes

# Falhas e Recuperação
node .agent/skills/board-agents/scripts/orchestrator.js recover      # Restaura o estado anterior (snapshot)
```

### 2. Comandos de Simulação e Retrocompatibilidade

O wrapper `board-agents.js` (ou diretamente o orquestrador) mantém suporte aos comandos clássicos:

```bash
node .agent/skills/board-agents/scripts/board-agents.js list                  # Status geral de todos os agentes
node .agent/skills/board-agents/scripts/board-agents.js trace roll            # Simula fluxo: rolagem de dados
node .agent/skills/board-agents/scripts/board-agents.js trace buy             # Simula fluxo: compra
node .agent/skills/board-agents/scripts/board-agents.js trace card            # Simula fluxo: carta de evento
node .agent/skills/board-agents/scripts/board-agents.js simulate [turnos]     # Simula N turnos automáticos
node .agent/skills/board-agents/scripts/board-agents.js repl                  # Abre o console interativo GSA
```

### 3. Execução Individual de Agentes

Cada agente é um arquivo autônomo e possui seu próprio CLI runner. Você pode executá-los diretamente para obter informações ou simular testes isolados:

```bash
node .agent/skills/board-agents/scripts/agents/01-infra-agent.js info     # Mostra metadados do agente
node .agent/skills/board-agents/scripts/agents/06-physics-agent.js test   # Roda o self-test (auto-diagnóstico)
node .agent/skills/board-agents/scripts/agents/08-ai-opponent-agent.js run # Executa simulação standalone
```

---

## Uso no Chat (Como Assistente)

Você pode me pedir para simular, rastrear ou auditar o sistema. Por exemplo:
- *"Audite a consistência do sistema usando o orquestrador"*
- *"Mostre a cadeia de agentes rodando ao rolar o dado"*
- *"Execute uma simulação de 5 rodadas e me dê a telemetria"*
- *"Rode o self-test do RuleValidatorAgent"*

Eu irei executar as sub-rotinas necessárias e gerar saídas formatadas demonstrando o comportamento do Game Sovereign Agent e seus 20 agentes.

# 🤖 Arquitetura de Agentes de IA - Metropolys

Este diretório contém a estrutura de Inteligência Artificial utilizada para o **desenvolvimento**, **simulação de mecânicas** e **automação de tarefas** no Metropolys. 

A arquitetura de IA divide-se em três pilares proprietários descritos abaixo.

---

## 🧭 Pilares do Ecossistema de IA

```
.agent/
├── README.md               # Este arquivo explicativo
├── skills/
│   ├── board-agents/       # O Motor de Simulação do Tabuleiro (Scripts JS)
│   ├── game-agents-cli/    # O Dicionário de comandos CLI para controle do Motor
│   └── metropolys-squad/   # O Time de Especialistas de Desenvolvimento (IA Persona)
```

### 1. ⚙️ board-agents (O Motor do Jogo)
Localizado em `skills/board-agents/scripts/agents/`, este módulo contém o código JavaScript real que implementa e simula as regras, fluxo de turnos, barramento de eventos (`event-bus.js`) e persistência temporária (`mock-state.js`) do tabuleiro.
- É composto por **20 agentes especialistas** rodando em Node.js (ex: `10-analytics-agent.js`, `04-rules-engine-agent.js`, etc.).
- Funciona como um **Gêmeo Digital (Digital Twin)** do jogo usado estritamente no ambiente de desenvolvimento para garantir integridade matemática e lógica de regras.

### 2. 🎛️ game-agents-cli (A Skill do Console)
Localizada em `skills/game-agents-cli/SKILL.md`, esta skill é um dicionário que mapeia o acesso aos scripts de simulação do tabuleiro a comandos de terminal simples (`npm run agent:*`).
- Permite que o desenvolvedor ou a própria IA de suporte interaja com os 20 agentes em tempo real de forma isolada, auditando logs, gerando simulações rápidas ou forçando estados específicos na partida (leilões, falência, movimentações).

### 3. 👥 metropolys-squad (O Time de Desenvolvimento)
Localizada em `skills/metropolys-squad/SKILL.md`, esta skill unifica em uma única entidade de IA as 6 personas de desenvolvimento do projeto. Quando ativado, o assistente adota os seguintes papéis:
1. **Líder Orquestrador:** Planeja o passo a passo e organiza a execução.
2. **Arquiteto de Software:** Zela pelas regras estruturais do projeto e designs limpos.
3. **Especialista de Banco de Dados (DBA):** Cuida de schemas, transações e estado do jogo.
4. **Desenvolvedor Sênior:** Constrói a lógica no NestJS e interfaces do Vue 3.
5. **Especialista em UI/UX:** Projeta telas premiums, microanimações e usabilidade.
6. **Engenheiro de Qualidade (QA):** Cria e executa testes resilientes via Playwright.

---

## 📜 Regras Globais
As decisões tomadas pelas ferramentas e personas de IA são guiadas pelas diretrizes absolutas descritas no arquivo `.AGENTS.md` localizado na raiz do projeto.

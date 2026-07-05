---
name: agent-orchestrator
description: Executa comandos do Game Sovereign Agent (GSA) do Metropolys, como detect, repair, consistency e metrics.
---

# Skill: Game Sovereign Agent (Orquestrador)

Esta skill interage com o Orquestrador central que gerencia os 20 agentes do sistema.

## Comandos Disponíveis via npm

```bash
npm run agent:orchestrator detect       # Detecta bugs
npm run agent:orchestrator repair       # Aplica reparos
npm run agent:orchestrator consistency  # Checa a consistência geral
npm run agent:orchestrator metrics      # Exibe métricas de uso
npm run agent:orchestrator recover      # Faz rollback de estado
npm run agent:orchestrator coordinate   # Exibe coordenação
```

**Uso pelo chat:** Peça *"rode a consistência do orquestrador"*, *"audite os agentes"* ou *"mostre as métricas do GSA"*.

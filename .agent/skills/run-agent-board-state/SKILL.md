---
name: run-agent-board-state
description: Executa o agente board-state do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar board-state-agent

Esta skill permite interagir diretamente com o agente **board-state-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:board-state info      # Exibe os metadados do agente
npm run agent:board-state status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:board-state test      # Roda os autotestes do agente isoladamente
npm run agent:board-state run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente board-state"*
- *"Mostre as infos do agente board-state"*

Eu irei rodar `npm run agent:board-state <comando>` para satisfazer o seu pedido.

---
name: run-agent-game-engine
description: Executa o agente game-engine do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar game-engine-agent

Esta skill permite interagir diretamente com o agente **game-engine-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:game-engine info      # Exibe os metadados do agente
npm run agent:game-engine status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:game-engine test      # Roda os autotestes do agente isoladamente
npm run agent:game-engine run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente game-engine"*
- *"Mostre as infos do agente game-engine"*

Eu irei rodar `npm run agent:game-engine <comando>` para satisfazer o seu pedido.

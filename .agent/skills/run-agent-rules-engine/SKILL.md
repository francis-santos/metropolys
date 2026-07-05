---
name: run-agent-rules-engine
description: Executa o agente rules-engine do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar rules-engine-agent

Esta skill permite interagir diretamente com o agente **rules-engine-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:rules-engine info      # Exibe os metadados do agente
npm run agent:rules-engine status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:rules-engine test      # Roda os autotestes do agente isoladamente
npm run agent:rules-engine run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente rules-engine"*
- *"Mostre as infos do agente rules-engine"*

Eu irei rodar `npm run agent:rules-engine <comando>` para satisfazer o seu pedido.

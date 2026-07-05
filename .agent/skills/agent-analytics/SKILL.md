---
name: agent-analytics
description: Executa o agente analytics do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar analytics-agent

Esta skill permite interagir diretamente com o agente **analytics-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:analytics info      # Exibe os metadados do agente
npm run agent:analytics status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:analytics test      # Roda os autotestes do agente isoladamente
npm run agent:analytics run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente analytics"*
- *"Mostre as infos do agente analytics"*

Eu irei rodar `npm run agent:analytics <comando>` para satisfazer o seu pedido.

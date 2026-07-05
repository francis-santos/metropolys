---
name: run-agent-notification
description: Executa o agente notification do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar notification-agent

Esta skill permite interagir diretamente com o agente **notification-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:notification info      # Exibe os metadados do agente
npm run agent:notification status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:notification test      # Roda os autotestes do agente isoladamente
npm run agent:notification run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente notification"*
- *"Mostre as infos do agente notification"*

Eu irei rodar `npm run agent:notification <comando>` para satisfazer o seu pedido.

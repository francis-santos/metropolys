---
name: agent-event-dispatcher
description: Executa o agente event-dispatcher do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar event-dispatcher-agent

Esta skill permite interagir diretamente com o agente **event-dispatcher-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:event-dispatcher info      # Exibe os metadados do agente
npm run agent:event-dispatcher status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:event-dispatcher test      # Roda os autotestes do agente isoladamente
npm run agent:event-dispatcher run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente event-dispatcher"*
- *"Mostre as infos do agente event-dispatcher"*

Eu irei rodar `npm run agent:event-dispatcher <comando>` para satisfazer o seu pedido.

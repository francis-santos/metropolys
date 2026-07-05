---
name: agent-data-persistence
description: Executa o agente data-persistence do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar data-persistence-agent

Esta skill permite interagir diretamente com o agente **data-persistence-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:data-persistence info      # Exibe os metadados do agente
npm run agent:data-persistence status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:data-persistence test      # Roda os autotestes do agente isoladamente
npm run agent:data-persistence run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente data-persistence"*
- *"Mostre as infos do agente data-persistence"*

Eu irei rodar `npm run agent:data-persistence <comando>` para satisfazer o seu pedido.

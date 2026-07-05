---
name: agent-matchmaking
description: Executa o agente matchmaking do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar matchmaking-agent

Esta skill permite interagir diretamente com o agente **matchmaking-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:matchmaking info      # Exibe os metadados do agente
npm run agent:matchmaking status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:matchmaking test      # Roda os autotestes do agente isoladamente
npm run agent:matchmaking run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente matchmaking"*
- *"Mostre as infos do agente matchmaking"*

Eu irei rodar `npm run agent:matchmaking <comando>` para satisfazer o seu pedido.

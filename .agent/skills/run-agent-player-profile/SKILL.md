---
name: run-agent-player-profile
description: Executa o agente player-profile do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar player-profile-agent

Esta skill permite interagir diretamente com o agente **player-profile-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:player-profile info      # Exibe os metadados do agente
npm run agent:player-profile status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:player-profile test      # Roda os autotestes do agente isoladamente
npm run agent:player-profile run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente player-profile"*
- *"Mostre as infos do agente player-profile"*

Eu irei rodar `npm run agent:player-profile <comando>` para satisfazer o seu pedido.

---
name: agent-human-player
description: Executa o agente human-player do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar human-player-agent

Esta skill permite interagir diretamente com o agente **human-player-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:human-player info      # Exibe os metadados do agente
npm run agent:human-player status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:human-player test      # Roda os autotestes do agente isoladamente
npm run agent:human-player run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente human-player"*
- *"Mostre as infos do agente human-player"*

Eu irei rodar `npm run agent:human-player <comando>` para satisfazer o seu pedido.

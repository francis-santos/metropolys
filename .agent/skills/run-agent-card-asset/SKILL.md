---
name: run-agent-card-asset
description: Executa o agente card-asset do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar card-asset-agent

Esta skill permite interagir diretamente com o agente **card-asset-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:card-asset info      # Exibe os metadados do agente
npm run agent:card-asset status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:card-asset test      # Roda os autotestes do agente isoladamente
npm run agent:card-asset run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente card-asset"*
- *"Mostre as infos do agente card-asset"*

Eu irei rodar `npm run agent:card-asset <comando>` para satisfazer o seu pedido.

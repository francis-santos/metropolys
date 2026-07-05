---
name: run-agent-turn-manager
description: Executa o agente turn-manager do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar turn-manager-agent

Esta skill permite interagir diretamente com o agente **turn-manager-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:turn-manager info      # Exibe os metadados do agente
npm run agent:turn-manager status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:turn-manager test      # Roda os autotestes do agente isoladamente
npm run agent:turn-manager run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente turn-manager"*
- *"Mostre as infos do agente turn-manager"*

Eu irei rodar `npm run agent:turn-manager <comando>` para satisfazer o seu pedido.

---
name: agent-physics
description: Executa o agente physics do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar physics-agent

Esta skill permite interagir diretamente com o agente **physics-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:physics info      # Exibe os metadados do agente
npm run agent:physics status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:physics test      # Roda os autotestes do agente isoladamente
npm run agent:physics run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente physics"*
- *"Mostre as infos do agente physics"*

Eu irei rodar `npm run agent:physics <comando>` para satisfazer o seu pedido.

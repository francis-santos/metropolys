---
name: agent-ui-ux
description: Executa o agente ui-ux do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar ui-ux-agent

Esta skill permite interagir diretamente com o agente **ui-ux-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:ui-ux info      # Exibe os metadados do agente
npm run agent:ui-ux status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:ui-ux test      # Roda os autotestes do agente isoladamente
npm run agent:ui-ux run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente ui-ux"*
- *"Mostre as infos do agente ui-ux"*

Eu irei rodar `npm run agent:ui-ux <comando>` para satisfazer o seu pedido.

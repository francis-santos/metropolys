---
name: agent-input
description: Executa o agente input do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar input-agent

Esta skill permite interagir diretamente com o agente **input-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:input info      # Exibe os metadados do agente
npm run agent:input status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:input test      # Roda os autotestes do agente isoladamente
npm run agent:input run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente input"*
- *"Mostre as infos do agente input"*

Eu irei rodar `npm run agent:input <comando>` para satisfazer o seu pedido.

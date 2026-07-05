---
name: run-agent-community
description: Executa o agente community do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar community-agent

Esta skill permite interagir diretamente com o agente **community-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:community info      # Exibe os metadados do agente
npm run agent:community status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:community test      # Roda os autotestes do agente isoladamente
npm run agent:community run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente community"*
- *"Mostre as infos do agente community"*

Eu irei rodar `npm run agent:community <comando>` para satisfazer o seu pedido.

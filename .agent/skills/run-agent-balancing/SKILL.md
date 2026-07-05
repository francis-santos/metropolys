---
name: run-agent-balancing
description: Executa o agente balancing do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar balancing-agent

Esta skill permite interagir diretamente com o agente **balancing-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:balancing info      # Exibe os metadados do agente
npm run agent:balancing status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:balancing test      # Roda os autotestes do agente isoladamente
npm run agent:balancing run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente balancing"*
- *"Mostre as infos do agente balancing"*

Eu irei rodar `npm run agent:balancing <comando>` para satisfazer o seu pedido.

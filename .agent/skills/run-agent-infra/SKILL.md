---
name: run-agent-infra
description: Executa o agente infra do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar infra-agent

Esta skill permite interagir diretamente com o agente **infra-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:infra info      # Exibe os metadados do agente
npm run agent:infra status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:infra test      # Roda os autotestes do agente isoladamente
npm run agent:infra run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente infra"*
- *"Mostre as infos do agente infra"*

Eu irei rodar `npm run agent:infra <comando>` para satisfazer o seu pedido.

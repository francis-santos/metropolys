---
name: run-agent-ai-opponent
description: Executa o agente ai-opponent do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar ai-opponent-agent

Esta skill permite interagir diretamente com o agente **ai-opponent-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:ai-opponent info      # Exibe os metadados do agente
npm run agent:ai-opponent status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:ai-opponent test      # Roda os autotestes do agente isoladamente
npm run agent:ai-opponent run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente ai-opponent"*
- *"Mostre as infos do agente ai-opponent"*

Eu irei rodar `npm run agent:ai-opponent <comando>` para satisfazer o seu pedido.

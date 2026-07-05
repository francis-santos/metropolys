---
name: agent-rule-validator
description: Executa o agente rule-validator do Metropolys via CLI. Permite rodar comandos isolados de teste e diagnóstico para este agente.
---

# Skill: Executar rule-validator-agent

Esta skill permite interagir diretamente com o agente **rule-validator-agent** de forma isolada.

## Como usar no terminal

Este agente foi mapeado no `package.json`. Você pode acionar os seguintes comandos de CLI:

```bash
npm run agent:rule-validator info      # Exibe os metadados do agente
npm run agent:rule-validator status    # Verifica a integridade e status de IDLE/ACTIVE
npm run agent:rule-validator test      # Roda os autotestes do agente isoladamente
npm run agent:rule-validator run       # Roda uma simulação standalone básica
```

**Uso pelo chat:** Você pode me pedir coisas como:
- *"Rode o teste do agente rule-validator"*
- *"Mostre as infos do agente rule-validator"*

Eu irei rodar `npm run agent:rule-validator <comando>` para satisfazer o seu pedido.

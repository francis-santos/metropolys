---
name: telegram-goal-reporter
description: Envia relatórios de progresso e conclusão para o Telegram quando estiver executando goals.
---

# Telegram Goal Reporter

## Quando usar

Use esta skill quando:
- estiver executando um goal complexo
- a tarefa puder levar mais de 5 minutos
- o usuário solicitar acompanhamento remoto

## Comportamento

Ao iniciar um goal:

1. Envie uma mensagem para o Telegram:
   - Objetivo
   - Horário de início

Durante a execução:

1. Envie atualizações apenas após marcos relevantes.
2. Evite spam.

Ao finalizar:

1. Gere um resumo executivo.
2. Liste arquivos alterados.
3. Informe sucesso ou falha.

## Envio para Telegram

Utilize (PowerShell / Windows):

```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot8768557818:AAGMiDB-SNWZEkVc4KGW6XJAanNEJlDoTPo/sendMessage" -Method POST -Body @{ chat_id = "553120021"; text = $MESSAGE }
```
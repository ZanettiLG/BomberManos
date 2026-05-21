---
name: bombermanos-patterns
description: client/, server/, gameserver/ e game/ deste repositorio. Use quando precisar decidir onde uma mudanca pertence ou preservar o padrao de camadas atual.
---

## Objetivo

Usar a estrutura atual do repositorio sem inventar novas camadas quando o padrao existente ja resolve o problema.

## Padroes por area

- `client/`: `pages` orquestram, `components` reutilizam UI ou canvas, `services` chamam HTTP, `models` descrevem contratos e `libs` concentram helpers de DOM/input.
- `server/`: `router -> controller -> service`, com Socket.IO em `connection/` e persistencia local em `database/`.
- `gameserver/`: espelha a ideia do backend de jogo, mas ainda e scaffold; trate-o como alvo de extracao, nao como runtime principal.
- `game/`: prototipo standalone de engine; nao e o mesmo fluxo do frontend React atual.

## Regras de decisao

- Mudancas de UI, formularios e navegacao vao para `client/`.
- Mudancas de auth, sessao, rotas HTTP, matchmaking ou game loop atual vao para `server/`.
- Mudancas em `gameserver/` devem ser explicitas sobre o que esta sendo extraido do `server/`.
- Mudancas em `game/` devem preservar a natureza de prototipo standalone.

## Guardrails

- Nao mova logica para `gameserver/` ou `game/` sem pedido explicito.
- Quando um contrato mudar, atualize os dois lados que o consomem.
- Prefira a menor mudanca correta dentro da camada atual antes de criar novas abstractions.

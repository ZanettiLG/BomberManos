---
name: bombermanos-runbook
description: setup local, portas, Redis, Postgres e scripts deste repositorio. Use quando precisar subir o ambiente, validar comandos ou depurar o boot local.
---

## Ordem recomendada de boot

1. `npm run install`
2. `docker compose up -d`
3. `psql -h localhost -U <usuario> -f sql/start.sql`
4. `npm --prefix client run build`
5. `PORT=3000 ... npm --prefix server run dev`
6. Opcionalmente `PORT=4000 ... npm --prefix gameserver run dev`

## Comandos importantes

- `client`: `npm run dev-vite`, `npm run build`
- `server`: `npm run dev`, `npm run build`
- `gameserver`: `npm run dev`, `npm run build`
- `game`: `npm run build`

## Caveats operacionais

- `server/` e `gameserver/` colidem se ambos usarem o `PORT` padrao.
- `client` com Vite nao tem proxy configurado para o backend.
- `server` serve `../client/build`, entao o build do frontend faz parte do fluxo integrado atual.
- O `docker-compose.yml` nao sobe Postgres, apenas Redis Stack.

## Quando encerrar a skill

Depois de estabilizar o ambiente, volte para as skills de arquitetura ou documentacao se a tarefa migrar para implementacao ou atualizacao de docs.

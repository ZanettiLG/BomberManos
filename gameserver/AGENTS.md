# GameServer

## Papel

- Extracao futura do backend de jogo.
- Hoje esta mais proximo de um scaffold tecnico do que de um servico completo.

## Estado atual

- `src/index.ts` sobe Express + Socket.IO.
- `src/connection/index.ts` ainda nao implementa o fluxo de conexao.
- `src/router/index.ts` e placeholder.
- `src/clients/redis/` ainda esta vazio.

## Regras locais

- Faca mudancas conservadoras e explicitas.
- Nao mova logica do `server/` para ca sem uma tarefa clara de extracao.
- Reaproveite contratos e naming do `server/` somente quando a tarefa pedir convergencia real.

## Comandos

- `npm run dev`
- `npm run build`
- `npm run start`

## Verificacao

- Rode `npm run build` apos mudancas.
- Se a mudanca tocar contratos compartilhados, revise tambem `server/` e `client/`.

# Server

## Papel

- Backend principal do projeto.
- Serve o frontend buildado, expoe rotas HTTP e mantem o fluxo atual de Socket.IO e game loop.

## Padrao de codigo

- `router/`: rotas HTTP
- `controllers/`: handlers finos
- `services/`: regra de negocio
- `connection/`: eventos de Socket.IO
- `database/`: persistencia local em arquivos
- `config/`: portas, sessao, validacoes e certs

## Regras locais

- Trate `server/src/database/index.ts` como fonte primaria do runtime atual para usuarios, sessoes e partidas.
- Nao assuma que Postgres ja substituiu o banco em arquivos.
- `src/index.ts` serve `../client/build`; mudancas de contrato costumam afetar frontend e backend juntos.
- Eventos Socket.IO devem permanecer alinhados com `client/src/pages/Game/*` e `client/src/components/Game.ts`.
- O servico sobe HTTP em `PORT` e HTTPS em `PORT + 1`.

## Comandos

- `npm run dev`
- `npm run build`
- `npm run start`

## Verificacao

- Rode `npm run build` apos mudancas.
- Se mudar rotas, cookies, sessao ou eventos, rode tambem o build do `client/`.

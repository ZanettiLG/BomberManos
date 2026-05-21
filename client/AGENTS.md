# Client

## Papel

- React + Vite + Tailwind para login, home, matchmaking e tela de jogo.
- O frontend conversa com o backend por fetch e Socket.IO.
- **Conecta-se apenas ao `server/`.** Nunca referencia `gameserver/` ou `game/`.

## Onde mexer

- `src/pages/`: fluxo de telas
- `src/components/`: UI reutilizavel e renderer do jogo
- `src/services/`: chamadas HTTP
- `src/models/`: contratos de dados
- `src/libs/`: helpers de formulario e input

## Regras locais

- Mantenha contratos de dados alinhados com `server/src/models` e eventos do backend.
- `src/services/request.ts` usa URLs relativas e cookies same-origin.
- `vite.config.ts` faz proxy de `/user`, `/match` e `/socket.io` para o backend; HMR funciona.
- `src/components/Game.ts` e `src/pages/Game/*` dependem dos nomes exatos dos eventos Socket.IO.
- Preserve o estilo atual de componentes simples antes de introduzir abstractions maiores.

## Comandos

- `npm run dev-vite`: servidor Vite
- `npm run dev`: watch helper, nao sobe o Vite
- `npm run build`: verificacao principal

## Verificacao

- Rode `npm run build` apos mudancas.
- Se alterar login, sessao, matchmaking ou sockets, valide o build do `server/` tambem.

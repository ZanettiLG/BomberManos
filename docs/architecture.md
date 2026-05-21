# Arquitetura

## Visao geral

O repositorio mistura tres fases do projeto:

- a aplicacao web atual em `client/` + `server/`
- uma extracao de backend de jogo em `gameserver/`
- um prototipo standalone de motor em `game/`

Para tarefas de manutencao e evolucao, considere `client/` e `server/` como a trilha principal.

## Componentes

### `client/`

Responsavel pela experiencia do usuario.

- `src/pages/`: orquestracao de telas e fluxo da aplicacao
- `src/components/`: UI reutilizavel e renderer em canvas
- `src/services/`: wrapper de HTTP (`fetch`)
- `src/models/`: contratos de dados do frontend
- `src/libs/`: helpers de formulario e input do jogo

Pontos importantes:

- `src/pages/Main.tsx` decide entre login e area do jogo via `GET /user`.
- `src/pages/Game/GameRoom.tsx` abre Socket.IO e participa do matchmaking.
- `src/components/Game.ts` desenha o estado do jogo em canvas a partir de eventos do socket.

### `server/`

Backend principal atualmente em uso.

- `src/router/`: define rotas `/user` e `/match`
- `src/controllers/`: handlers HTTP finos
- `src/services/`: regras de negocio
- `src/connection/`: eventos de Socket.IO
- `src/database/`: persistencia local baseada em arquivos
- `src/config/`: portas, certificados, sessao e validacoes

Pontos importantes:

- `src/index.ts` serve `../client/build` e configura CORS.
- `src/server.ts` sobe HTTP em `PORT` e HTTPS em `PORT + 1`.
- `src/services/match/data.ts` mantem matchmaking em memoria.
- `src/services/game/data.ts` mantem o game loop e o estado do mapa em memoria.

### `gameserver/`

Backend de jogo em extracao, mas ainda incompleto.

- `src/index.ts` sobe Express + Socket.IO
- `src/connection/index.ts` ainda nao implementa o fluxo de conexao
- `src/router/index.ts` e placeholder
- `src/clients/redis/` ainda esta vazio

Na pratica, ele deve ser tratado como area experimental ate que a extracao seja explicitamente retomada.

### `game/`

Prototipo standalone do motor em TypeScript + Webpack.

- `src/gamerender.ts`: renderizacao
- `src/playercontroller.ts`: input/local control
- `src/gameobject/`, `src/mapobject/`, `src/spriteobject/`: hierarquia do motor
- `src/index.ts`: bootstrap do prototipo

Ele nao e a mesma runtime usada hoje pelo `client/`.

### `sql/`

Scripts de banco:

- `start.sql`: cria o banco `bombermanos` e carrega o schema
- `constructor.sql`: tabelas e FKs iniciais

O schema serve como base de infraestrutura, mas nao representa toda a persistencia ativa do backend atual.

## Fluxos de runtime

### Login e sessao

1. O usuario interage com `client/src/pages/User/*`.
2. O frontend chama `/user/login`, `/user/register` e `/user`.
3. `server/src/controllers/user/*` delega para `server/src/services/user/*`.
4. O backend grava sessao e responde com cookie `token`.

### Matchmaking

1. `client/src/pages/Game/GameRoom.tsx` abre Socket.IO com `sessionId`.
2. `server/src/connection/index.ts` valida a sessao no handshake.
3. Eventos `match-search`, `match-confirm`, `match-unconfirm` e `player-started` entram pelo backend.
4. `server/src/services/match/data.ts` gerencia salas, confirmacoes e contagem regressiva em memoria.

### Jogo em andamento

1. Quando a partida inicia, `server/src/services/game/data.ts` cria `GameMatch` e mapa aleatorio.
2. O servidor emite `game-ready` e `game-update`.
3. `client/src/components/Game.ts` redesenha o canvas com tiles e jogadores.

## Endpoints HTTP

### Usuario

- `POST /user/login`
- `POST /user/logout`
- `POST /user/register`
- `GET /user`

### Match

- `GET /match/modes`
- `GET /match/search`

## Eventos Socket.IO ativos no backend principal

### Client -> server

- `match-search`
- `match-confirm`
- `match-unconfirm`
- `player-started`

### Server -> client

- `check-playing`
- `match-update`
- `match-start`
- `match-starting`
- `game-ready`
- `game-update`

## Persistencia

Hoje existem duas camadas de persistencia no repositorio:

- persistencia real de runtime em `server/src/database/index.ts`, baseada em `./data`
- cliente Postgres e scripts SQL, usados mais como infraestrutura paralela do que como fonte primaria do fluxo atual

Isso significa que uma mudanca no schema SQL nao muda automaticamente o comportamento principal do backend atual.

## Limites e decisoes atuais

- Mudancas de contrato entre frontend e backend exigem atualizacao dos dois lados.
- O `gameserver/` nao deve receber migracoes de logica do `server/` sem uma tarefa explicita de extracao.
- O `game/` e referencia de motor/prototipo, nao o ponto principal para features do fluxo web atual.

## Riscos conhecidos

- segredo de sessao fixo em `server/src/config/index.ts`
- certificados de desenvolvimento versionados no repositorio
- CORS com origins fixos
- root script `npm run dev` dependente de `start`, o que o torna Windows-only
- schema SQL com referencias incompletas, incluindo FK para `characters`

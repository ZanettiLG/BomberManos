# Arquitetura

## Visao geral

O repositorio contem **4 aplicacoes** que evoluíram em fases diferentes do projeto:

| App | Papel | Status | Stack |
|-----|-------|--------|-------|
| `client/` | Frontend web | **Ativo** | React + Vite + Tailwind |
| `server/` | Backend HTTP + Socket.IO | **Ativo** | Express + Socket.IO + banco em arquivos |
| `gameserver/` | Extracao futura do backend de jogo | **Scaffold** | Express + Socket.IO (handlers vazios) |
| `game/` | Prototipo standalone do motor | **Standalone** | TypeScript + Webpack + WebSocket nativo |

**Fluxo principal hoje:** `client/` + `server/`. Os outros dois sao experimentais ou planejados.

---

## Mapa de portas

| Servico | Porta HTTP | Porta HTTPS | Configuracao |
|---------|-----------|-------------|--------------|
| `server` | `PORT` (padrao 3000) | `PORT + 1` (padrao 3001) | `server/src/config/index.ts` |
| `gameserver` | `PORT` (padrao 3000) | `PORT + 1` (padrao 3001) | `gameserver/src/config/index.ts` |
| `client` (Vite dev) | 5173 | -- | `client/vite.config.ts` (sem proxy) |
| `client` (build) | Servido pelo `server` | -- | `server/src/index.ts` serve `../client/build` |
| `game` (webpack dev) | 8080 (padrao webpack) | -- | `game/webpack.config.js` |
| Redis | 6379 | -- | `docker-compose.yml` |
| Redis Insight | 8001 | -- | `docker-compose.yml` |
| Postgres | 5432 | -- | `docker-compose.yml` |

**Conflito conhecido:** `server` e `gameserver` padrao para 3000. Use `PORT=3000` para um e `PORT=4000` para o outro.

---

## Conexoes entre apps

```
┌──────────┐   HTTP (fetch) relative   ┌──────────┐
│          │ ──────────────────────────▶ │          │
│  client  │   Socket.IO (same-origin)   │  server  │
│  (React) │ ◀────────────────────────── │ (Express)│
│          │   Static files (client/build)│          │
└──────────┘                             └──────────┘
                                              │
                                         (sem conexao)
                                              │
                                         ┌────┴─────┐
                                         │gameserver │
                                         │(scaffold) │
                                         └──────────┘

┌──────────┐
│   game   │   WebSocket nativo → porta 5000 (fora do projeto)
│(prototipo)│   Sem conexao com client, server ou gameserver
└──────────┘
```

**Nao existem** conexoes entre `server` e `gameserver`, `client` e `gameserver`, ou `game` e qualquer outro app. Nao ha pacote `shared/` ou `common/` — modelos sao duplicados entre `client/` e `server/`.

---

## Componentes

### `client/`

Frontend React. Conecta-se ao `server/` exclusivamente.

- `src/pages/`: orquestracao de telas
- `src/components/`: UI reutilizavel e renderer canvas (`Game.ts`)
- `src/services/`: chamadas HTTP via `fetch` com URLs **relativas** e `credentials: 'same-origin'`
- `src/models/`: contratos de dados (duplicados do server)
- `src/libs/`: helpers de formulario e input

**Como se conecta:**
- **HTTP:** URLs relativas (`/user/login`, `/user`, `/match/modes`) — sem URL base absoluta
- **Socket.IO:** `io({ auth: { token: sessionId } })` sem URL explicita (same-origin)
- **Nao tem** proxy Vite configurado, entao `npm run dev-vite` na porta 5173 nao encaminha ao backend

### `server/`

Backend principal. Serve o frontend buildado, expoe API REST e Socket.IO.

- `src/router/`: rotas `/user/*` e `/match/*`
- `src/controllers/`: handlers HTTP
- `src/services/`: regras de negocio (user, match, game)
- `src/connection/`: eventos Socket.IO
- `src/database/`: persistencia em arquivos (`server/data/`)
- `src/config/`: portas, certificados, sessao, CORS

**O que serve:**
- **Static files:** `express.static('../client/build')` — o frontend buildado
- **HTTP:** rotas de usuario e match
- **Socket.IO:** matchmaking e game loop

### `gameserver/`

Scaffold para extracao futura do backend de jogo.

- `src/connection/index.ts`: handler de conexao **vazio** — nenhum evento registrado
- `src/router/index.ts`: **vazio** — nenhuma rota implementada
- `src/clients/redis/`: arquivo existe mas **vazio**
- `src/clients/postgres/`: referencia `postgres` config mas **nao usado**
- `src/data/`: JSONs de config (`characters.json`, `skills.json`, etc.) — carregados mas **nao usados por codigo**

Nao se conecta a nenhum outro app. Tratar como area experimental.

### `game/`

Prototipo standalone do motor, sem integracao com o resto do projeto.

- Usa **WebSocket nativo** (nao Socket.IO) apontando para `wss://<host>:5000` — porta que **nao existe** no repositorio
- Canvas rendering com hierarquia de objetos (`GameObject`, `MapObject`, `SpriteSheet`)
- Assets carregados de `/assets/tilemaps/` e `/data/`
- Nao importa nada de `client/`, `server/` ou `gameserver/`

---

## Endpoints HTTP

### Usuario (`/user`)

| Metodo | Rota | Controller | Descricao |
|--------|------|-----------|-----------|
| POST | `/user/login` | `controllers/user/login.ts` | Valida credenciais, cria sessao, seta cookie `token` |
| POST | `/user/logout` | `controllers/user/logout.ts` | Destroi sessao, limpa cookie `token` |
| POST | `/user/register` | `controllers/user/register.ts` | Cria novo usuario |
| GET | `/user` | `controllers/user/info.ts` | Le cookie `token`, retorna user + sessionId |

### Match (`/match`)

| Metodo | Rota | Controller | Descricao |
|--------|------|-----------|-----------|
| GET | `/match/modes` | `controllers/match/modes.ts` | Retorna modos de jogo disponiveis |
| GET | `/match/search` | `controllers/match/search.ts` | Retorna partida atual do usuario |

---

## Eventos Socket.IO

### Client → Server

| Evento | Disparado por | Arquivo |
|--------|--------------|---------|
| `match-search` | `GameRoom.tsx` ao conectar e nao estar em partida | `GameRoom.tsx:35` |
| `match-confirm` | `MatchRoom.tsx` quando jogador confirma | `MatchRoom.tsx:26` |
| `match-unconfirm` | `MatchRoom.tsx` quando jogador desconfirma | `MatchRoom.tsx:32` |
| `player-started` | `Game.ts` quando canvas inicializa | `Game.ts:61` |
| `player-move` | `Game.ts` quando jogador clica no mapa | `Game.ts:77` (comentado) |

### Server → Client

| Evento | Proposito | Consumido por |
|--------|-----------|---------------|
| `check-playing` | Verifica se jogador ja esta em partida | `GameRoom.tsx:31` |
| `match-update` | Estado da sala (jogadores, confirmacoes) | `GameRoom.tsx:42`, `MatchRoom.tsx:39` |
| `match-starting` | Contagem regressiva | `MatchRoom.tsx:43` |
| `match-start` | Partida iniciou (payload com dados do jogo) | `GameRoom.tsx:47` |
| `game-ready` | Server confirma que jogador esta pronto | `Game.ts:63` |
| `game-update` | Atualizacao periodica do estado do jogo | `Game.ts:67` |

**Eventos nao sao type-safe:** O modelo `socket.ts` no client define tipos genericos com placeholders. Os eventos sao usados como strings com `as any`.

---

## Game loop

O game loop ativo esta **dentro do `server/`**, em `server/src/services/game/data.ts`:

1. Quando uma partida inicia, `GameMatch` gera mapa aleatorio 11x11 com paredes e caixas
2. Server emite `game-ready` + `game-update` periodicos
3. `client/src/components/Game.ts` renderiza tiles e jogadores no canvas
4. Pathfinding usa A* (stub) e `directPath`
5. Jogadores movem-se por objetivos (clique no mapa)

---

## Persistencia

Existem **duas camadas nao alinhadas**:

| Camada | Local | Usada por | Status |
|--------|-------|-----------|--------|
| Arquivos JSON | `server/data/` | `server/src/database/index.ts` | **Runtime ativo** |
| Postgres | `sql/constructor.sql` + `docker-compose.yml` | Clientes SQL instalados mas **nao usados** | Infraestrutura planejada |

Uma mudanca no schema SQL **nao altera** o comportamento do backend atual.

---

## CORS

Ambos `server` e `gameserver` tem origins fixas identicas:

```
http://localhost:8000
http://localhost:5173
http://127.0.0.1:8000
http://127.0.0.1:5173
http://192.168.0.113:8000
```

- **5173** = Vite dev server
- **8000** = porta historica (provavelmente producao anterior)
- Porta 3000 nao esta na lista — funciona porque `client` e servido do mesmo origin via static files

---

## Modelos compartilhados (duplicados)

| Contrato | `client/src/models/` | `server/src/models/` |
|----------|---------------------|---------------------|
| IUser | `User.ts` | `user.ts` |
| Session | — | `session.ts` |
| IMatchSetup | `match-setup.ts` | `match-setup.ts` |
| IMatchPlayer | `match-player.ts` | `match-player.ts` |
| IMatchType | `match-type.ts` | `match-type.ts` |
| IGameSetup | `game-setup.ts` (vazio) | `game-setup.ts` (vazio) |
| APIResponse | `APIResponse.ts` | `response.ts` |

Nao ha pacote compartilhado. Alterar um contrato exige editar os dois lados.

---

## Riscos conhecidos

- Segredo de sessao fixo em `server/src/config/index.ts`
- Certificados TLS de desenvolvimento versionados
- CORS com origins fixas e desatualizadas
- Schema SQL referencia `characters(id)` sem a tabela existir
- `gameserver/` e `server/` competem pela porta 3000 por padrao
- Eventos Socket.IO nao tem contratos type-safe
- Game loop roda dentro do server, dificultando extracao futura
- `game/` aponta para servidor externo (porta 5000) que nao existe no projeto

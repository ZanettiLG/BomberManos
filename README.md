# BomberManos

BomberManos e um projeto de jogo multiplayer dividido em quatro areas principais:

- `client/`: interface React + Vite + Tailwind
- `server/`: login, sessao, matchmaking e game loop atual
- `gameserver/`: extracao futura do backend de jogo, ainda incompleta
- `game/`: prototipo standalone do motor/renderizacao

Hoje, a pilha principal em funcionamento e `client + server`. Os diretorios `gameserver/` e `game/` existem, mas ainda nao representam o fluxo principal de producao local.

## Status atual

- O `server/` serve o build do `client/` e tambem expoe HTTP, HTTPS e Socket.IO.
- O estado de usuarios, sessoes e partidas ainda depende fortemente do banco em arquivos em `server/data/`.
- O `gameserver/` esta mais proximo de um scaffold do que de um servico pronto.
- O schema SQL em `sql/` ajuda a subir Postgres, mas nao reflete 100% do fluxo realmente usado pelo backend atual.

## Estrutura do repositorio

```text
.
|- client/      Frontend React
|- server/      Backend principal e servidor Socket.IO
|- gameserver/  Backend de jogo em extracao
|- game/        Prototipo standalone do motor
|- sql/         Bootstrap e schema de Postgres
|- docs/        Documentacao para humanos
|- .opencode/   Skills locais para OpenCode
|- AGENTS.md    Regras de projeto para agentes
|- opencode.json
```

## Setup rapido

### Requisitos

- Node.js com npm
- Docker ou Docker Compose

### Instalar dependencias

```bash
npm run install
```

### Subir Redis e Postgres

```bash
docker compose up -d
```

O compose sobe Redis Stack e Postgres 16 Alpine. O schema do banco e inicializado automaticamente via `sql/constructor.sql`.

A conexao padrao do Postgres e:

```bash
postgres://postgres@localhost/bombermanos
```

### Variaveis de ambiente

Copie `.env.example` e ajuste:

```bash
cp .env.example .env
```

Variaveis:

| Variavel | Padrao | Descricao |
|----------|--------|-----------|
| `PORT` | `3000` | Porta HTTP do `server` (HTTPS = PORT+1) |
| `GAMESERVER_PORT` | `4000` | Porta HTTP do `gameserver` |
| `POSTGRES` | — | String de conexao Postgres |
| `SESSION_SECRET` | `jacareperneta` | Segredo da sessao (troque em producao) |
| `CORS_ORIGINS` | — | Origins CORS separados por virgula |

## Fluxos de execucao

### Dev mode completo — `npm run dev` (recomendado)

```bash
docker compose up -d
npm run dev
```

Acesse **`http://localhost:3000`** — o server serve o client buildado.

- Builda automaticamente client, server e gameserver
- Depois mantem watch em todos (recompila ao salvar)
- Se as portas `3000/3001/4000/4001` ja estiverem ocupadas, o comando falha cedo com aviso para evitar subir um stack quebrado
- `gameserver` em `http://localhost:4000`

Se precisar limpar uma sessao antiga de desenvolvimento, rode:

```bash
npm run dev:stop
```

### Dev mode com Vite (HMR) — `npm run dev:vite`

```bash
docker compose up -d
npm run dev:vite
```

Acesse **`http://localhost:5173`** — Vite com HMR + proxy para o backend.

- O Vite faz proxy de `/user`, `/match` e `/socket.io` para `localhost:3000`
- Se as portas `3000/3001/4000/4001` ja estiverem ocupadas, o comando falha cedo com aviso
- `localhost:3000` só tem as rotas HTTP e Socket.IO (sem frontend)
- `gameserver` em `http://localhost:4000`

## Scripts principais

| Escopo | Comando | Uso |
| --- | --- | --- |
| raiz | `docker compose up -d` | sobe Redis Stack e Postgres 16 Alpine |
| raiz | `npm run install` | instala dependencias de `client`, `server` e `gameserver` |
| raiz | `npm run start:login` | builda `client`, builda `server` e sobe o backend principal |
| raiz | `npm run start:game` | builda e sobe `gameserver` |
| raiz | `npm run dev` | server (3000), gameserver (4000) e client build em paralelo |
| raiz | `npm run dev:vite` | Vite (5173) com proxy + server + gameserver em paralelo |
| client | `npm run dev-vite` | sobe o servidor Vite com proxy para backend |
| client | `npm run dev` | watch helper; nao sobe o Vite |
| client | `npm run build` | build de producao do frontend |
| server | `npm run dev` | watch TypeScript + restart do backend |
| server | `npm run build` | compila o backend principal |
| gameserver | `npm run dev` | watch TypeScript + restart do backend de jogo |
| gameserver | `npm run build` | compila o backend de jogo |
| game | `npm run build` | build do prototipo standalone |

## Documentacao

- `docs/architecture.md`: arquitetura, limites de responsabilidade e fluxos
- `docs/development.md`: setup local, comandos e caveats
- `docs/opencode.md`: como usar OpenCode neste repositorio
- `AGENTS.md`: instrucoes de alto nivel para agentes
- `client/AGENTS.md`, `server/AGENTS.md`, `gameserver/AGENTS.md`, `game/AGENTS.md`, `sql/AGENTS.md`: instrucoes locais por area

## Documentacao para agentes

Este repositorio agora inclui:

- `AGENTS.md` no root, conforme a recomendacao oficial do OpenCode
- `opencode.json` com `instructions` para carregar instrucoes adicionais do monorepo
- skills locais em `.opencode/skills/`

As escolhas acima seguem a documentacao oficial:

- `https://opencode.ai/docs/rules/`
- `https://opencode.ai/docs/skills/`
- `https://opencode.ai/docs/agents/`
- `https://opencode.ai/docs/config/`

## Caveats importantes

- `server` padrao porta 3000; `gameserver` padrao porta 4000 (agora sem conflito)
- `server` serve `../client/build` — para HMR use `npm run dev:vite`
- Certificados TLS de desenvolvimento versionados
- Schema SQL referencia `characters(id)` sem a tabela existir
- `SESSION_SECRET` tem fallback fixo (`jacareperneta`) — configure via `.env` em producao
- Persistencia ativa e em arquivos JSON (`server/data/`), nao em Postgres

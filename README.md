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
- Docker ou Docker Compose para Redis
- Postgres local com `psql`

### Instalar dependencias

```bash
npm run install
```

### Subir Redis

```bash
docker compose up -d
```

Observacao: o `docker-compose.yml` sobe apenas Redis Stack. Postgres continua sendo responsabilidade do ambiente local.

### Criar o banco Postgres

```bash
psql -h localhost -U <usuario> -f sql/start.sql
```

### Variaveis importantes

- `PORT`: porta base do servico. O projeto abre HTTP em `PORT` e HTTPS em `PORT + 1`.
- `POSTGRES`: string de conexao usada pelos clientes SQL.

Exemplo de valores usados no Gitpod:

```bash
export PORT=3000
export POSTGRES=postgres://gitpod@localhost/bombermanos
```

## Fluxos de execucao

### Fluxo mais alinhado ao repositorio atual

1. Gere o frontend:

```bash
npm --prefix client run build
```

2. Suba o backend principal:

```bash
PORT=3000 POSTGRES=postgres://gitpod@localhost/bombermanos npm --prefix server run dev
```

3. Se precisar validar a extracao do backend de jogo:

```bash
PORT=4000 POSTGRES=postgres://gitpod@localhost/bombermanos npm --prefix gameserver run dev
```

### Fluxo de frontend com Vite

```bash
npm --prefix client run dev-vite
```

Importante:

- `client/src/services/request.ts` usa URLs relativas e cookies same-origin.
- `client/vite.config.ts` nao define proxy para o backend.
- Se voce usar Vite em `5173`, talvez precise ajustar proxy/origem manualmente.

## Scripts principais

| Escopo | Comando | Uso |
| --- | --- | --- |
| raiz | `npm run install` | instala dependencias de `client`, `server` e `gameserver` |
| raiz | `npm run start:login` | builda `client`, builda `server` e sobe o backend principal |
| raiz | `npm run start:game` | builda e sobe `gameserver` |
| raiz | `npm run dev` | atalho Windows-only; nao e portavel para Linux/macOS |
| client | `npm run dev-vite` | sobe o servidor Vite |
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

- O `server/` e o `gameserver/` usam a mesma porta padrao (`3000`) se `PORT` nao for definido.
- O `server/` serve `../client/build`, entao o frontend precisa estar buildado para o fluxo integrado atual.
- Existem certificados TLS de desenvolvimento em `server/src/security/` e `gameserver/src/security/`.
- O schema SQL referencia `characters(id)`, mas a tabela nao e criada em `sql/constructor.sql`.
- Existe um segredo fixo em `server/src/config/index.ts`; trate o projeto como ambiente de desenvolvimento e nao como setup pronto para producao.

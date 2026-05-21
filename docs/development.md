# Desenvolvimento local

## Requisitos

- Node.js com npm
- Docker ou Docker Compose

## Mapa de portas

| Servico | Porta | Descricao |
|---------|-------|-----------|
| `server` HTTP | `PORT` (padrao 3000) | Backend principal |
| `server` HTTPS | `PORT + 1` (padrao 3001) | TLS dev |
| `gameserver` HTTP | `PORT` (padrao 4000) | Scaffold — sem conflito |
| `gameserver` HTTPS | `PORT + 1` (padrao 4001) | TLS dev |
| `client` Vite | 5173 | Dev server com proxy para backend |
| Redis | 6379 | Docker Compose |
| Redis Insight | 8001 | Docker Compose |
| Postgres | 5432 | Docker Compose |

## Infra local

### Docker Compose

Sobe Redis Stack e Postgres 16 Alpine com init automatico do schema:

```bash
docker compose up -d
```

Conexao padrao Postgres:

```bash
postgres://postgres@localhost/bombermanos
```

## Variaveis de ambiente

Copie `.env.example` da raiz e ajuste:

```bash
cp .env.example .env
```

| Variavel | Padrao | Onde afeta |
|----------|--------|------------|
| `PORT` | `3000` | `server` (HTTP) |
| `POSTGRES` | — | `server` e `gameserver` |
| `SESSION_SECRET` | `jacareperneta` | `server` — sessao |
| `CORS_ORIGINS` | `localhost:3000,5173` | `server` e `gameserver` |

## Instalacao

### Instalar tudo

```bash
npm run install
```

### Instalar por pacote

```bash
npm --prefix client install
npm --prefix server install
npm --prefix gameserver install
```

## Como rodar

> Veja `docs/architecture.md` para o mapa completo de conexoes, eventos Socket.IO e endpoints HTTP.

### Dev mode completo — `npm run dev` (recomendado)

```bash
docker compose up -d
npm run dev
```

Acesse **`http://localhost:3000`** — o server serve o client buildado.

- Builda client, server e gameserver automaticamente no inicio
- Depois mantem watch em todos (recompila ao salvar)
- Se as portas `3000/3001/4000/4001` ja estiverem ocupadas, o comando falha cedo com aviso
- `gameserver` em `http://localhost:4000`

Se uma sessao antiga ficar presa, limpe os processos do projeto com:

```bash
npm run dev:stop
```

### Dev mode com Vite (HMR) — `npm run dev:vite`

```bash
docker compose up -d
npm run dev:vite
```

Acesse **`http://localhost:5173`** — Vite com HMR + proxy para o backend.

- Proxy de `/user`, `/match` e `/socket.io` para `localhost:3000`
- Se as portas `3000/3001/4000/4001` ja estiverem ocupadas, o comando falha cedo com aviso
- `localhost:3000` so tem as rotas HTTP e Socket.IO (sem frontend)
- `gameserver` em `http://localhost:4000`

### Backend principal com frontend buildado (produção)

```bash
npm --prefix client run build
npm --prefix server run dev
```

Acesse `http://localhost:3000`.

### Backend de jogo em extracao

```bash
PORT=4000 npm --prefix gameserver run dev
```

### Frontend com Vite (standalone)

```bash
npm --prefix client run dev-vite
```

Com proxy configurado, as chamadas para `/user`, `/match` e `/socket.io` sao redirecionadas ao backend.

## Scripts por area

### Raiz

- `npm run install`
- `npm run start:login`
- `npm run start:game`
- `npm run dev` — server (3000) + gameserver (4000) + client build
- `npm run dev:vite` — Vite (5173) + server + gameserver

### `client/`

- `npm run dev-vite`: servidor Vite com proxy
- `npm run dev`: watch helper
- `npm run build`: build de producao

### `server/`

- `npm run dev`: compila em watch, copia certs e reinicia
- `npm run build`: compila TypeScript
- `npm run start`: executa `build/index.js`

### `gameserver/`

- `npm run dev`
- `npm run build`
- `npm run start`

### `game/`

- `npm run start`
- `npm run dev`
- `npm run build`

## Verificacao recomendada apos mudancas

### Frontend

```bash
npm --prefix client run build
```

### Backend principal

```bash
npm --prefix server run build
```

### Backend de jogo

```bash
npm --prefix gameserver run build
```

### Prototipo standalone

```bash
npm --prefix game run build
```

Se uma mudanca altera contratos entre frontend e backend, rode pelo menos os builds de `client/` e `server/`.

## Caveats

- `server/` serve `../client/build` — HMR so via `npm run dev:vite`
- `gameserver/` e scaffold — handlers Socket.IO e rotas HTTP estao vazios
- `server` (3000) e `gameserver` (4000) — sem conflito de porta
- Persistencia ativa e em arquivos JSON (`server/data/`), nao em Postgres
- `game/` e prototipo standalone, aponta para WebSocket em porta 5000 (fora do projeto)
- Modelos de dados duplicados entre `client/` e `server/` — sem pacote shared
- Eventos Socket.IO sao strings soltas com `as any`, sem contrato type-safe
- Certificados TLS de desenvolvimento versionados
- `SESSION_SECRET` tem fallback fixo — configure `.env` em producao

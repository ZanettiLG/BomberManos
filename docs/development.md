# Desenvolvimento local

## Requisitos

- Node.js com npm
- Docker ou Docker Compose
- Postgres local com `psql`

## Infra local

### Redis

O arquivo `docker-compose.yml` sobe apenas Redis Stack:

```bash
docker compose up -d
```

Portas expostas:

- `6379`: Redis
- `8001`: Redis Insight / Redis Stack UI

### Postgres

O bootstrap atual do banco e manual:

```bash
psql -h localhost -U <usuario> -f sql/start.sql
```

O Gitpod usa:

```bash
postgres://gitpod@localhost/bombermanos
```

## Variaveis de ambiente

### `server/` e `gameserver/`

- `PORT`: porta base do servico
- `POSTGRES`: string de conexao com Postgres

Sem `PORT`, ambos tentam usar `3000`, o que causa conflito.

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

### Backend principal com frontend buildado

Este e o caminho mais proximo da integracao atual do projeto.

1. Build do frontend:

```bash
npm --prefix client run build
```

2. Backend principal:

```bash
PORT=3000 POSTGRES=postgres://gitpod@localhost/bombermanos npm --prefix server run dev
```

3. Acesse:

- `http://localhost:3000`
- `https://localhost:3001`

### Backend de jogo em extracao

```bash
PORT=4000 POSTGRES=postgres://gitpod@localhost/bombermanos npm --prefix gameserver run dev
```

### Frontend com Vite

```bash
npm --prefix client run dev-vite
```

Use este modo apenas sabendo que:

- o frontend usa fetch com URLs relativas
- o frontend usa cookies same-origin
- nao existe proxy configurado no `vite.config.ts`

## Scripts por area

### Raiz

- `npm run install`
- `npm run start:login`
- `npm run start:game`
- `npm run dev` (Windows-only)

### `client/`

- `npm run dev-vite`: servidor Vite
- `npm run dev`: watch helper
- `npm run build`: build de producao

### `server/`

- `npm run dev`: compila em watch, copia certs e reinicia o processo
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

- `server/` serve `../client/build`, entao HMR nao faz parte do fluxo integrado atual.
- `gameserver/` ainda nao possui fluxo real de Socket.IO implementado.
- O backend atual usa bastante persistencia em arquivos locais (`server/data/`).
- O schema SQL ainda tem desvio em relacao ao runtime atual.
- Os certificados TLS atuais sao de desenvolvimento e estao no repositorio.

## Gitpod

O arquivo `.gitpod.yml` documenta o fluxo local mais fiel que existe hoje:

- Redis em Docker
- Postgres inicializado por `sql/start.sql`
- stack principal em `PORT=3000`
- stack de jogo em `PORT=4000`

Se houver duvida sobre ordem de boot ou portas, use `.gitpod.yml` como referencia operacional.

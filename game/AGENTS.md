# Game

## Papel

- Prototipo standalone do motor em TypeScript + Webpack.
- Nao e o mesmo runtime usado hoje pelo `client/`.

## Onde mexer

- `src/index.ts`: bootstrap do prototipo
- `src/gamerender.ts`: renderizacao
- `src/playercontroller.ts`: input
- `src/gameobject/`, `src/mapobject/`, `src/spriteobject/`: hierarquia do motor

## Regras locais

- Preserve o papel de prototipo/engine e nao assuma integracao direta com o fluxo web atual.
- Assets e JSONs sao carregados por caminhos publicos como `/assets` e `/data`.
- Antes de criar novos objetos ou subsistemas, siga as hierarquias ja presentes em `gameobject/`, `mapobject/` e `spriteobject/`.

## Comandos

- `npm run start`
- `npm run dev`
- `npm run build`

## Verificacao

- Rode `npm run build` apos mudancas.

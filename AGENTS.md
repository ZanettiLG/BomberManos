# BomberManos

## Contexto rapido

- Monorepo com `client/`, `server/`, `gameserver/`, `game/` e `sql/`.
- O fluxo principal hoje e `client + server`.
- `gameserver/` e `game/` existem, mas nao sao o caminho principal para features web atuais.
- O backend principal ainda depende bastante de persistencia local em arquivos.

## Fluxo de trabalho para agentes

- Leia o `AGENTS.md` da area tocada antes de editar arquivos daquele pacote.
- Use `plan` quando o escopo estiver ambiguo ou cruzar varios pacotes.
- Use `explore` para mapeamento read-only e `general` para pesquisa paralela mais profunda.
- Prefira `glob`, `grep` e `read` antes de bash para explorar a codebase.
- Para docs externas, use documentacao oficial via `webfetch` ou qualquer MCP de docs ja disponivel no ambiente.

## Agentes locais

- Todos foram configurados com `mode: all` para poderem ser usados de duas formas.
- Como subagentes: o OpenCode pode escolhe-los automaticamente quando a descricao combinar com a tarefa.
- Como agente principal: voce pode seleciona-los diretamente quando quiser uma sessao inteira focada naquele workflow.
- `docs-writer`: mantem `README.md`, `docs/` e `AGENTS.md` alinhados com a codebase.
- `contract-reviewer`: revisa mudancas que cruzam `client/` e `server/`, com foco em HTTP e Socket.IO.
- `runtime-verifier`: roda verificacoes focadas de build e config para o pacote alterado.
- `opencode-maintainer`: mantem `opencode.json`, `.opencode/`, skills e instrucoes do harness.
- `security-auditor`: faz review read-only de auth, cookies, secrets, CORS, TLS e persistencia.

## Verificacao

- O repositorio nao tem um comando portavel unico de verificacao.
- Rode `npm run build` no pacote alterado.
- Se mudar contratos HTTP ou Socket.IO, valide `client/` e `server/` juntos.
- Se editar `AGENTS.md`, `.opencode/skills/` ou `opencode.json`, valide com `opencode debug config`.

## Documentacao e instrucoes adicionais

- `opencode.json` carrega `docs/opencode.md` e os `AGENTS.md` locais das areas principais.
- Atualize `README.md`, `docs/` e os `AGENTS.md` relevantes quando comandos, arquitetura ou contratos mudarem.

## Mapa rapido

- `client/`: UI, fetch, socket client e renderer em canvas
- `server/`: auth, sessao, matchmaking, Socket.IO e game loop atual
- `gameserver/`: extracao futura do backend de jogo
- `game/`: prototipo standalone do motor
- `sql/`: bootstrap de banco e schema inicial

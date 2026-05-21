---
name: bombermanos-opencode
description: AGENTS.md, opencode.json, tools, skills e uso de MCPs neste repositorio. Use quando editar instrucoes do OpenCode ou decidir como agentes devem pesquisar, validar e documentar mudancas.
---

## Regras que seguem a doc oficial

- Mantenha `AGENTS.md` do root curto e especifico ao projeto.
- Use `opencode.json` com `instructions` para carregar instrucoes adicionais do monorepo.
- Crie skills em `.opencode/skills/<nome>/SKILL.md` com frontmatter valido.
- Depois de editar `opencode.json`, `AGENTS.md` ou skills, rode `opencode debug config` e reinicie o OpenCode.

## Escolha de agentes

- `plan` para analise e escopo sem editar.
- `build` para implementacao quando o caminho estiver claro.
- `explore` para mapeamento read-only da codebase.
- `general` para pesquisa mais profunda ou trabalho paralelo.

## Escolha de tools

- Prefira `glob`, `grep` e `read` para explorar codigo.
- Use `bash` para build, install, execucao e validacoes objetivas.
- Use `webfetch` para documentacao oficial quando a URL estiver conhecida.

## Uso de MCPs

- Se um MCP de docs como `context7` estiver disponivel no ambiente, use-o para lookup rapido e exemplos de API.
- Se um MCP de exemplos como `gh_grep` estiver disponivel, use-o apenas quando a doc oficial nao bastar.
- Nao adicione MCPs ao config do projeto sem uma necessidade real do time ou sem ambiente preparado.

## Validacao minima

- `opencode debug config`
- build do pacote alterado
- revisao dos `AGENTS.md` e docs impactados pela mudanca

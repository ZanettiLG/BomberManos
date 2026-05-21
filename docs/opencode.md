# OpenCode neste repositorio

Este repositorio foi preparado para uso com OpenCode seguindo a documentacao oficial de Rules, Agents, Skills e Config.

## O que foi configurado

- `AGENTS.md` no root para regras de projeto
- `AGENTS.md` em pastas-chave para contexto local
- `opencode.json` com `instructions` para carregar instrucoes adicionais do monorepo
- skills locais em `.opencode/skills/`

Isso segue a recomendacao oficial de manter o `AGENTS.md` principal enxuto e usar `opencode.json` para referenciar arquivos extras em monorepos.

## Quando usar cada agente embutido

- `build`: implementacao direta quando o escopo esta claro
- `plan`: analise, escopo e propostas sem editar codigo
- `explore`: leitura rapida da codebase, mapeamento e busca
- `general`: pesquisa mais profunda ou trabalho paralelo

## Agentes customizados locais

Todos os agentes locais especializados deste repositorio usam `mode: all`.

Isso permite:

- roteamento automatico pelo OpenCode quando a descricao do agente combinar com a tarefa
- uso direto como agente principal quando voce quiser uma sessao inteira focada naquele contexto

### `docs-writer`

Use quando a mudanca exige atualizar `README.md`, `docs/` ou `AGENTS.md`.

### `contract-reviewer`

Use quando a mudanca cruza `client/` e `server/`, especialmente em:

- rotas HTTP
- cookies e sessao
- eventos Socket.IO
- formatos de payload

### `runtime-verifier`

Use para rodar verificacoes objetivas sem misturar implementacao com execucao de comandos. Ele foi pensado para:

- `npm run build` no pacote alterado
- validacao conjunta de `client/` e `server/` quando contratos mudarem
- `opencode debug config` quando a camada de agentes mudar

### `opencode-maintainer`

Use para editar:

- `opencode.json`
- `.opencode/agents/`
- `.opencode/skills/`
- `AGENTS.md`
- `docs/opencode.md`

Esse agente deve seguir a documentacao oficial do OpenCode antes de mudar o harness.

### `security-auditor`

Use para review read-only de riscos em:

- auth e sessao
- cookies e segredos
- CORS
- certificados e TLS
- persistencia local e SQL

## Como o roteamento automatico funciona aqui

- As descricoes dos agentes foram escritas com gatilhos concretos como nomes de diretorio, tipos de mudanca e arquivos.
- Isso aumenta a chance de o OpenCode chamar o agente certo automaticamente quando a tarefa combinar com esse contexto.
- Como os agentes usam `mode: all`, o mesmo agente continua disponivel para selecao direta como agente principal.

## Convencoes para este projeto

- Leia primeiro o `AGENTS.md` do pacote que sera alterado.
- Prefira `glob`, `grep` e `read` antes de bash para exploracao da codebase.
- Para comportamento de bibliotecas e APIs externas, consulte documentacao oficial antes de codar.
- Se um MCP de documentacao como `context7` estiver disponivel no ambiente do usuario, ele e preferivel para lookup rapido. Se nao estiver, use `webfetch` contra a documentacao oficial.
- Se um MCP de exemplos como `gh_grep` estiver disponivel, use-o apenas quando a documentacao oficial nao for suficiente para exemplos concretos.

## Como manter a documentacao alinhada

Atualize `README.md`, `docs/` e os `AGENTS.md` afetados quando houver mudanca em:

- estrutura do repositorio
- comandos de build/run
- contratos entre `client/` e `server/`
- papel de `gameserver/` ou `game/`
- fluxo de setup local

## Como estender a camada de agentes

### Novo AGENTS local

Adicione `AGENTS.md` na pasta relevante quando uma area tiver regras tecnicas proprias.

### Nova skill

Crie:

```text
.opencode/skills/<nome>/SKILL.md
```

Regras importantes:

- nome em lowercase com hifens
- frontmatter com `name` e `description`
- escopo especifico o suficiente para ser ativado so quando fizer sentido

### Novo agente

Crie:

```text
.opencode/agents/<nome>.md
```

Regras importantes:

- prefira `mode: subagent` para fluxos especializados
- escreva `description` explicando o que o agente faz e quando aciona-lo
- use `permission` para limitar bash e impedir edicoes quando for um agente de review
- mantenha o prompt focado no workflow real do repositorio, nao em instrucoes genericas

### Novas instrucoes compartilhadas

Se uma nova instrucao precisar ser sempre carregada, referencie o arquivo em `opencode.json` usando `instructions`.

## Validacao

Depois de editar `opencode.json`, `AGENTS.md` ou `.opencode/skills/`:

1. rode `opencode debug config`
2. revise os arquivos resolvidos
3. reinicie o OpenCode para garantir reload da configuracao e das skills

## Referencias oficiais usadas nesta organizacao

- `https://opencode.ai/docs/`
- `https://opencode.ai/docs/rules/`
- `https://opencode.ai/docs/agents/`
- `https://opencode.ai/docs/skills/`
- `https://opencode.ai/docs/tools/`
- `https://opencode.ai/docs/mcp-servers/`
- `https://opencode.ai/docs/config/`

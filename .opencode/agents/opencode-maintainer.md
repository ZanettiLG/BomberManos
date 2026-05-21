---
description: opencode.json, AGENTS.md, .opencode/agents e .opencode/skills.
  Mantem a configuracao do OpenCode neste repositorio quando a tarefa envolver o
  proprio harness ou as instrucoes para agentes. Pode ser chamado
  automaticamente ou usado diretamente para sessoes focadas no harness.
mode: subagent
temperature: 0.1
permission:
  "*": allow
  doom_loop: ask
  external_directory:
    "*": ask
    /home/zanbook/.local/share/opencode/tool-output/*: allow
    /tmp/opencode/*: allow
    /home/zanbook/.claude/skills/deep-agents-core/*: allow
    /home/zanbook/.claude/skills/langchain-dependencies/*: allow
    /home/zanbook/.claude/skills/langchain-fundamentals/*: allow
    /home/zanbook/.claude/skills/framework-selection/*: allow
    /home/zanbook/.claude/skills/langgraph-persistence/*: allow
    /home/zanbook/.claude/skills/deep-agents-memory/*: allow
    /home/zanbook/.claude/skills/langgraph-human-in-the-loop/*: allow
    /home/zanbook/.claude/skills/langchain-rag/*: allow
    /home/zanbook/.claude/skills/plannotator-compound/*: allow
    /home/zanbook/.claude/skills/find-docs/*: allow
    /home/zanbook/.claude/skills/playwright-cli/*: allow
    /home/zanbook/.claude/skills/deep-agents-orchestration/*: allow
    /home/zanbook/.claude/skills/langchain-middleware/*: allow
    /home/zanbook/.claude/skills/langgraph-fundamentals/*: allow
    /home/zanbook/.agents/skills/design-patterns-iterator/*: allow
    /home/zanbook/.agents/skills/design-patterns-strategy/*: allow
    /home/zanbook/.agents/skills/framework-selection/*: allow
    /home/zanbook/.agents/skills/langchain-dependencies/*: allow
    /home/zanbook/.agents/skills/langchain-fundamentals/*: allow
    /home/zanbook/.agents/skills/design-patterns-observer/*: allow
    /home/zanbook/.agents/skills/design-patterns-adapter/*: allow
    /home/zanbook/.agents/skills/design-patterns-abstract-factory/*: allow
    /home/zanbook/.agents/skills/orchestrate-hierarchical-plan/*: allow
    /home/zanbook/.agents/skills/deep-agents-core/*: allow
    /home/zanbook/.agents/skills/design-patterns-decorator/*: allow
    /home/zanbook/.agents/skills/design-patterns-builder/*: allow
    /home/zanbook/.agents/skills/plannotator-compound/*: allow
    /home/zanbook/.agents/skills/design-patterns-prototype/*: allow
    /home/zanbook/.agents/skills/design-patterns-proxy/*: allow
    /home/zanbook/.agents/skills/design-patterns-flyweight/*: allow
    /home/zanbook/.agents/skills/design-patterns-composite/*: allow
    /home/zanbook/.agents/skills/design-patterns-state/*: allow
    /home/zanbook/.agents/skills/context7-mcp/*: allow
    /home/zanbook/.agents/skills/langgraph-persistence/*: allow
    /home/zanbook/.agents/skills/design-patterns-template-method/*: allow
    /home/zanbook/.agents/skills/design-patterns-index/*: allow
    /home/zanbook/.agents/skills/design-patterns-memento/*: allow
    /home/zanbook/.agents/skills/design-patterns-facade/*: allow
    /home/zanbook/.agents/skills/design-patterns-bridge/*: allow
    /home/zanbook/.agents/skills/deep-agents-orchestration/*: allow
    /home/zanbook/.agents/skills/design-patterns-mediator/*: allow
    /home/zanbook/.agents/skills/langchain-rag/*: allow
    /home/zanbook/.agents/skills/langgraph-fundamentals/*: allow
    /home/zanbook/.agents/skills/design-patterns-command/*: allow
    /home/zanbook/.agents/skills/deep-agents-memory/*: allow
    /home/zanbook/.agents/skills/design-patterns-visitor/*: allow
    /home/zanbook/.agents/skills/design-patterns-singleton/*: allow
    /home/zanbook/.agents/skills/design-patterns-chain-of-responsibility/*: allow
    /home/zanbook/.agents/skills/langchain-middleware/*: allow
    /home/zanbook/.agents/skills/design-patterns-factory-method/*: allow
    /home/zanbook/.agents/skills/langgraph-human-in-the-loop/*: allow
    /home/zanbook/.agents/skills/find-skills/*: allow
    /home/zanbook/Projects/ZanDevs/BomberManos/.opencode/skills/doc-coauthoring/*: allow
    /home/zanbook/Projects/ZanDevs/BomberManos/.opencode/skills/bombermanos-opencode/*: allow
    /home/zanbook/Projects/ZanDevs/BomberManos/.opencode/skills/bombermanos-runbook/*: allow
    /home/zanbook/Projects/ZanDevs/BomberManos/.opencode/skills/bombermanos-patterns/*: allow
    /home/zanbook/Projects/ZanDevs/BomberManos/.opencode/skills/webapp-testing/*: allow
    /home/zanbook/Projects/ZanDevs/BomberManos/.opencode/skills/bombermanos-docs/*: allow
  question: deny
  plan_enter: deny
  plan_exit: deny
  repo_clone: deny
  repo_overview: deny
  read:
    "*.env": ask
    "*.env.*": ask
    "*.env.example": allow
  skill:
    typescript-best-practices: allow
    langchain-best-practices: allow
  bash:
    "*": deny
    git status*: allow
    git diff*: allow
    opencode debug config*: allow
model: opencode-go/deepseek-v4-flash
---

Voce cuida apenas da camada de OpenCode do projeto.

Escopo permitido:

- `opencode.json`
- `AGENTS.md`
- `.opencode/agents/`
- `.opencode/skills/`
- `docs/opencode.md`

Regras:

- Siga a documentacao oficial do OpenCode antes de propor ou aplicar mudancas.
- Prefira `AGENTS.md` curto no root e detalhe adicional em arquivos carregados por `instructions`.
- Para skills, use nomes validos, frontmatter minimo e gatilhos claros.
- Sempre valide com `opencode debug config`.
- Sempre avise que o OpenCode precisa ser reiniciado depois da mudanca.
---
name: bombermanos-docs
description: README.md, docs/ e AGENTS.md deste repositorio. Use quando mudar arquitetura, scripts, setup, contratos ou qualquer contexto que humanos e agentes precisem encontrar rapido.
---

## Checklist de atualizacao

- Atualize `README.md` para visao geral, setup e links principais.
- Atualize `docs/architecture.md` quando responsabilidades, fluxos ou contratos mudarem.
- Atualize `docs/development.md` quando comandos, portas, envs ou bootstrap local mudarem.
- Atualize `docs/opencode.md` quando o uso de OpenCode, AGENTS, skills ou validacao mudar.
- Atualize o `AGENTS.md` da pasta afetada se a mudanca introduzir regras locais novas.

## Estilo esperado

- README enxuto, orientado a onboarding.
- Docs com detalhes operacionais e arquiteturais.
- `AGENTS.md` curtos, focados em contexto local, verificacao e guardrails.

## Sinais de que a documentacao ficou incompleta

- Mudou um comando e so um arquivo foi atualizado.
- Mudou um contrato `client <-> server` e apenas um lado foi documentado.
- Mudou a estrutura do repositorio sem atualizar mapa, runbook ou AGENTS local.

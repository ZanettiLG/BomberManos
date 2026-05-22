# Plano de Transformacao

## Objetivo

Transformar a codebase atual em um produto multiplayer web jogavel, monetizavel e escalavel. As metas sao:

- entregar um core loop de Bomberman funcional (bombas, explosoes, power-ups, rounds e vitoria);
- organizar a arquitetura em camadas com separacao clara entre plataforma, partida e conteudo;
- implementar retencao e monetizacao compativeis com o mercado de jogos web em 2026;
- garantir que cada decisao tecnica sirva ao produto, nao o contrario.

## Diagnostico honesto da codebase

### O que realmente funciona ponta a ponta hoje

Registro → login → matchmaking automatico → grid + movimento de jogadores:

1. Usuario registra com username + senha → armazenado como JSON em `server/data/users/<uuid>.json`.
2. Login gera sessao com JWT assinado (`SESSION_SECRET`) → cookie `token`.
3. Cliente detecta auth → mostra selecao de modo (`solo`/`coop` e subtipo como `duelo`/`lutinha`).
4. Socket.IO conecta com `sessionId` como token → matchmaking aloca slots em `MatchSetup` em memoria.
5. Todos confirmam → countdown de 5s → partida inicia.
6. Grid 11x11 com paredes e caixas renderiza no canvas.
7. Movimento via setas/WASD → posicao normalizada → broadcast `game-update`.

### O que NAO funciona ou esta quebrado

| Problema | Severidade |
|---|---|
| **Sessao expira em 30 segundos** — `sessionConfig.expiration = 0.5 * 60 * 1000`. Partida real e injogavel. | Critico |
| **Cookie de auth sem flags de seguranca** — sem `HttpOnly`, `Secure` ou `SameSite`. | Alto |
| **Nao existem bombas, explosoes, power-ups, rounds ou condicao de vitoria** — o core loop do genero Bomberman nao foi implementado. | Critico |
| **A* pathfinding quebrado** — `aPath()` em `server/src/services/game/data.ts` retorna array vazio. O jogo usa `directPath()` como fallback. | Medio |
| **Nao existe tela de pos-partida** — sem stats, sem vencedor, sem persistencia de resultado. | Alto |
| **Nao existe progressao de conta** — sem XP, nivel, moeda, leaderboard ou historico. | Alto |
| **Nao existe monetizacao** — sem loja, cosmeticos, battle pass ou modelo de receita. | Alto |
| **Nao existe party system** — nao da para jogar com amigos, nao tem room code. | Medio |
| **Schema SQL com FK quebrada** — `match_users.character` referencia `characters(id)` mas a tabela `characters` nao existe. | Medio |
| **Cliente POST nao envia `credentials: 'include'`** — assimetria com GET, pode quebrar em producao. | Medio |
| **Tipos de evento Socket.IO no client sao stubs** — todos os handlers usam `as any`. | Baixo |
| **Duas implementacoes de cliente de jogo coexistindo** — `client/src/components/Game.ts` e `game/` como prototipo separado. | Arquitetural |

### O que existe mas nao e usado

- **Postgres**: `docker-compose.yml` sobe o container, `sql/constructor.sql` cria schema, `server/src/clients/postgres/index.ts` tem 212 linhas de implementacao pronta — **zero chamadas no runtime**.
- **Redis**: container sobe na porta 6379 — **nenhum codigo conecta**.
- **SeaweedFS**: container sobe com S3 na porta 8333 — **nenhum codigo conecta**.
- **gameserver/**: sobe Express + Socket.IO na porta 4000 — **handlers vazios, zero logica de jogo**.
- **game/**: prototipo standalone com canvas proprio, conecta em `wss://...:5000` — **porta sem servidor no repositorio**.

## Jornada completa do usuario

Esta secao define o fluxo esperado do ponto de vista do jogador. Toda decisao de engenharia deve servir esta jornada.

### 1. Descoberta e primeiro acesso

- Jogador recebe link de um amigo ou acessa diretamente a URL.
- A landing page carrega em <3 segundos.
- O jogo oferece **guest play** imediato: "Jogar agora" sem cadastro.
- Guest tem acesso a partidas rapidas com um personagem padrao.
- Banner sutil convida a criar conta para salvar progresso e desbloquear cosmeticos.

**Regra de negocio**: guest play e ilimitado, mas progresso, cosmeticos, ranked e historico exigem conta.

### 2. Cadastro e login

- Social login (Google, Discord, GitHub) como opcao primaria.
- Email/senha como fallback.
- Username unico escolhido no primeiro login (nao no cadastro — reduz friccao).
- Sessao persiste por dias (refresh token), nao segundos.
- Cookie de sessao com `HttpOnly`, `Secure` e `SameSite=Strict`.

**Regra de negocio**: username entre 3-16 caracteres, unico, imutavel por 30 dias apos a criacao. Guest pode converter conta mantendo o historico da sessao.

### 3. Onboarding

- Ao primeiro login, jogador entra em um **tutorial interativo de 60 segundos**.
- Tutorial ensina: mover, colocar bomba, destruir caixas, coletar power-up, vencer round.
- Primeira vitoria acontece em <2 minutos (bot facilitado ou mapa simples).
- Ao concluir, jogador recebe recompensa de onboard (moeda + cosmetico exclusivo).

**Regra de negocio**: tutorial e obrigatorio apenas na primeira sessao. Pode ser pulado, mas recompensa e perdida.

### 4. Lobby e matchmaking

- Tela inicial pos-login mostra: modos de jogo, partida rapida, jogar com amigos, loja, perfil.
- **Partida rapida**: 1 clique → fila → partida em <10s (preenche com bots se necessario).
- **Jogar com amigos**: gera room code de 6 digitos, amigos entram via `/join/<code>`.
- **Modos de jogo**: lista de modos disponiveis com descricao e numero de jogadores na fila.
- Fila mostra: modo, jogadores esperando, tempo estimado, botao de cancelar.

**Regras de negocio**:
- Timeout de fila: 60s. Apos isso, preenche slots restantes com bots.
- Maximo de 3 filas simultaneas por modo (uma por jogador).
- Room code expira em 5 minutos sem atividade.

### 5. Pre-partida

- Ao encontrar partida, todos veem lobby com slots, personagens e confirmacao.
- 10 segundos para confirmar. Quem nao confirma volta para fila.
- Durante confirmacao, jogador pode trocar de personagem (entre os que possui).
- Countdown de 5 segundos com transicao visual para a partida.

**Regra de negocio**: se um jogador cancelar apos confirmacao confirmada por todos, perde 1 ponto de fair play. 3 pontos negativos em 24h = timeout de fila de 15 minutos.

### 6. Durante a partida

- Grid com paredes indestrutiveis, caixas destrutiveis, power-ups escondidos.
- Jogadores spawnam nos cantos do mapa.
- **Comandos do cliente**: mover (4 direcoes), parar, colocar bomba.
- **Servidor autoritativo**: valida movimento, gerencia bombas, calcula explosoes, aplica power-ups.
- **Ticks fixos**: 20 ticks/s (50ms). Cliente interpola entre estados.
- HUD mostra: tempo restante, vidas, power-ups ativos, kills, posicao no round.
- Mapa encolhe progressivamente nos ultimos 30s (morte subita) para evitar empates.

**Regras de negocio do dominio Bomberman**:
- Grid 15x15, paredes indestrutiveis em padrao xadrez.
- Cada jogador comeca com 1 bomba, alcance 2, velocidade base.
- Bomba explode apos 3 segundos em cruz (cima, baixo, esquerda, direita), alcance base 2.
- Explosao destroe caixas no caminho, revela power-ups, mata jogadores no alcance.
- Caixas tem 60% de chance de soltar power-up ao serem destruidas.
- Power-ups stackaveis: +1 bomba, +1 alcance, +velocidade, chute de bomba (kick), luva (arremessar bomba).
- Morte: jogador perde 1 vida. Se tem vidas restantes, respawna no spawn inicial com 2s de invulnerabilidade.
- Round termina quando: sobra 1 jogador vivo OU tempo esgota.
- Partida: melhor de 3 rounds (first to 2).
- Empate no tempo: morte subita (mapa encolhe ate sobrar 1 tile central).

### 7. Pos-partida

- Tela de resultado com:
  - Vencedor destacado com animacao.
  - Stats individuais: kills, mortes, caixas destruidas, power-ups coletados, tempo sobrevivido.
  - XP ganho (base + bonus por desempenho).
  - Moeda ganha (base + bonus por vitoria).
  - Progresso em missoes diarias/semanais.
  - Mudanca de ranking (se modo ranked).
- Botoes: "Jogar novamente", "Voltar ao lobby", "Convidar para revanche" (se partida com amigos).
- Resultado persiste em Postgres imediatamente ao fim da partida.

**Regras de negocio**:
- XP base: 50 por partida + 30 por vitoria + 5 por kill + 2 por caixa destruida.
- Moeda base: 20 por partida + 30 por vitoria + 5 por kill.
- Partida com amigo: +10% XP e moeda.
- Limite diario de ganho: 2000 XP, 1000 moedas (anti-farming).

### 8. Progressao de conta

**Niveis de jogador**:
- Cada nivel requer `100 * nivel` XP.
- Nivel maximo: 100 (cosmetico, sem vantagem competitiva).
- Recompensa por nivel: moeda, cosmeticos, emotes, slots de personagem.
- A cada 10 niveis: recompensa premium (skin exclusiva, moldura de perfil).

**Ranking competitivo**:
- Sistema de Elo por modo de jogo.
- Tiers: Bronze → Prata → Ouro → Platina → Diamante → Mestre.
- Partidas ranked so estao disponiveis para contas (nao guest).
- Seasons de 8 semanas com reset parcial de ranking e recompensas sazonais.

**Missoes**:
- Diarias (3 por dia): "Vença 1 partida", "Destrua 20 caixas", "Colete 5 power-ups".
- Semanais (5 por semana): "Vença 10 partidas", "Jogue 3 partidas em dupla".
- Recompensas: XP bonus, moeda, cosmeticos temporarios.

**Conquistas**:
- Lista fixa de achievements: primeira vitoria, 100 kills, 1000 caixas destruidas, etc.
- Cada conquista desbloqueia badge exibivel no perfil e recompensa em moeda.

### 9. Entre sessoes (loop de retencao)

- **Daily reward**: bonus diario crescente (1-7 dias), reseta se perder um dia.
- **Battle Pass**: free track com recompensas basicas, premium track (R$25-40) com cosmeticos exclusivos.
- **Eventos sazonais**: mapas tematicos e cosmeticos limitados (Halloween, Natal, Verao).
- **Notificacoes**: amigo online, convite para partida, novo cosmetico disponivel.

### 10. Loja e monetizacao

- **Moeda gratuita** (Ouro): ganha jogando, missoes, daily rewards.
- **Moeda premium** (Gemas): compra com dinheiro real. Pacotes de R$5 a R$100.
- **Loja de cosmeticos**:
  - Skins de personagem (R$10-30 em gemas ou 5000 ouro).
  - Efeitos de explosao (cores, particulas, temas).
  - Rastros de bomba (trilha visual ao colocar bomba).
  - Emotes (dancinha, provocacao, comemoracao).
  - Molduras de perfil e badges.
- **Battle Pass** (R$25): renova a cada 8 semanas. Free track + Premium track.
- **Sem pay-to-win**: nada na loja afeta mecanica de jogo.

**Regra de negocio**: cosmeticos sao cosmeticos. Personagens tem skins, mas stats sao identicos.

## Regras de negocio do BomberManos

### Dominio do jogo

| Regra | Detalhe |
|---|---|
| **Grid** | 15x15 celulas. Paredes indestrutiveis em posicoes (impar, impar). |
| **Caixas** | Grid preenchido com 40% de caixas destrutiveis em posicoes validas (excluindo spawns e corredores). |
| **Spawns** | 2 jogadores: (1,1) e (13,13). 4 jogadores: (1,1), (1,13), (13,1), (13,13). 8 jogadores: cantos + meios das bordas. |
| **Bombas** | Jogador coloca 1 por tick no tile atual. Timer de 3s (60 ticks a 20tps). Explosao em cruz com alcance definido. |
| **Explosoes** | Propagacao para nas paredes indestrutiveis. Destroi caixas. Para no primeiro tile que encontra power-up. Chain reaction: explosao detona bombas adjacentes imediatamente. |
| **Power-ups** | Itens dropados ao destruir caixa. 60% de chance. Tipos: Bomba+, Alcance+, Velocidade+, Kick, Luva, Invulnerabilidade (7s), Bomba Remota. Todos stackam exceto Invulnerabilidade e Remota. |
| **Morte** | Jogador perde vida ao tocar explosao. Se tem vidas restantes, respawna apos 3s com 2s de invulnerabilidade. Sem vidas = eliminado do round. |
| **Vida** | 2 vidas por jogador no modo padrao. Modo hardcore: 1 vida. |
| **Vitoria no round** | Ultimo sobrevivente. Se tempo esgotar (3 min) e >1 vivo: morte subita. |
| **Vitoria na partida** | Melhor de 3 rounds. Placar 2-0 = vitoria. 1-1 vai para round 3. |
| **Empate** | Morte subita ativa em todos os rounds simultaneamente: mapa encolhe 1 camada de borda a cada 5s ate restar 1 celula ou alguem morrer. |
| **Bots** | Preenchem slots vazios para manter partidas cheias. Dificuldade ajustavel: facil (move aleatorio), medio (pathfinding simples), dificil (evita explosoes, prioriza power-ups). |

### Matchmaking e partidas

| Regra | Detalhe |
|---|---|
| **Modos** | Solo (free-for-all), Dupla (2v2), Esquadrao (4v4). |
| **Tamanhos** | Solo: 2/4/8 jogadores. Dupla: 2/4 times. Esquadrao: 2 times. |
| **Fila** | Timeout 60s. Apos timeout, preenche com bots. |
| **Confirmacao** | 10s para confirmar. Slots nao confirmados voltam para fila. |
| **Abandono** | -1 fair play. -3 em 24h = timeout de 15 min de fila. |
| **Desconexao** | Reconexao em ate 30s mantem jogador na partida (bot assume controle). Apos 30s = abandono. |
| **Room code** | 6 digitos alfanumericos. Expira em 5 min sem atividade. |
| **Ranked** | Elo-based, so para contas (nao guest). Matchmaking balanceia por Elo ±200. |

### Economia e progressao

| Regra | Detalhe |
|---|---|
| **XP** | Base 50/partida + 30/vitoria + 5/kill + 2/caixa. Cap diario: 2000 XP. |
| **Ouro** | Base 20/partida + 30/vitoria + 5/kill. Cap diario: 1000 ouro. |
| **Gemas** | Compra com dinheiro real. 100 gemas = ~R$5. |
| **Niveis** | `100 * nivel` XP. Max nivel 100. |
| **Fair play** | Sistema de reputacao. 0-3 negativo = timeout de fila. Reseta a cada 24h. |
| **Seasons** | 8 semanas. Reset parcial de ranking. Recompensas por tier atingido. |

### Conteudo

| Regra | Detalhe |
|---|---|
| **Mapas** | Conjunto base de 3-5 mapas comittados no repositorio (`.tmj`). Rotacao aleatoria por partida. |
| **Personagens** | 1 personagem gratuito. Novos desbloqueados com ouro/gemas. Stats identicos, diferenca visual apenas. |
| **Cosmeticos** | Skins, efeitos, rastros, emotes. Nao afetam jogabilidade. |
| **Conteudo sazonal** | Eventos tematicos com mapas e cosmeticos temporarios. |

## Estrategia de produto

### Posicionamento

BomberManos e um jogo multiplayer web de acao, gratuito, com partidas rapidas de 3-5 minutos. Genero classico com execucao moderna: cosmeticos, seasons e social.

### Publico-alvo

- Primario: jogadores casuais web, 16-35 anos, que buscam partidas rapidas no navegador.
- Secundario: jogadores competitivos que querem ranked e leaderboard.
- Terciario: grupos de amigos (party/room code).

### Diferencial competitivo

- **Zero friccao**: joga no navegador, sem download, sem cadastro obrigatorio.
- **Partidas rapidas**: 3-5 minutos, ideal para intervalos.
- **Party com amigos**: room code de 6 digitos, sem complicacao.
- **Bomberman classico com qualidade moderna**: cosmeticos, seasons, ranked.

### Metricas de sucesso

| Metrica | Alvo (6 meses pos-lancamento) |
|---|---|
| DAU (daily active users) | 500+ |
| Retencao D1 / D7 / D30 | 40% / 20% / 10% |
| Tempo medio de sessao | 15 minutos |
| Partidas por DAU | 5+ |
| Conversao guest → conta | 15% |
| Conversao conta → pagante | 5% |
| ARPU mensal | R$8-15 |

### Modelo de receita

| Fonte | % da receita esperada |
|---|---|
| Battle Pass | 35% |
| Gemas (cosmeticos) | 40% |
| Pacotes de gemas one-time | 20% |
| Outros (eventos, collabs) | 5% |

## Principios arquiteturais

Estes principios guiam decisoes tecnicas em todas as fases:

1. **Produto primeiro, infra depois** — toda decisao de engenharia precisa entregar valor ao jogador. Nao construa o que o produto ainda nao precisa.
2. **Servidor autoritativo** — o cliente envia comandos (mover, bomba), o servidor valida e computa o estado real.
3. **Estado permanente vs transiente** — dados que sobrevivem a partida (contas, progresso, cosmeticos) vao para Postgres. Estado da partida vive em memoria e morre com ela.
4. **Plataforma nao depende de tick loop** — `server/` gerencia auth, matchmaking e orquestracao, mas nao simula o jogo.
5. **Partidas sao alocaveis e descartaveis** — uma room por partida, isolada, com ciclo de vida explicito.
6. **Simplicidade primeiro** — otimizacoes de rede (prediction, rollback) entram depois que o jogo basico funciona.
7. **Observabilidade desde o inicio** — logs estruturados, correlation ID, metricas basicas por partida.

## Roadmap de transformacao

O roadmap esta ordenado por **valor entregue ao produto**, nao por dependencia tecnica.

---

### Fase 0: Urgencias — tornar o produto funcional hoje

Objetivo: corrigir o que esta quebrado no fluxo atual para que seja possivel jogar uma partida completa.

**Entregas**:

| # | Entrega | Impacto |
|---|---|---|
| 0.1 | Corrigir expiracao de sessao — `sessionConfig.expiration` de 30s para 7 dias. Adicionar `HttpOnly`, `Secure`, `SameSite=Strict` ao cookie. | Jogador consegue ficar logado. |
| 0.2 | Corrigir `credentials: 'include'` nas chamadas POST do client. | Requisicoes autenticadas funcionam consistentemente. |
| 0.3 | Remover strings magicas de eventos Socket.IO — centralizar em arquivo de constantes compartilhado entre `client/` e `server/`. | Contrato explicito e facil de evoluir. |
| 0.4 | Corrigir FK quebrada em `sql/constructor.sql` — criar tabela `characters` ou remover FK ate que exista. | Schema de Postgres compilavel. |

**Criterio de saida**: usuario faz login e permanece logado por dias. Schema SQL valido.

---

### Fase 1: Core loop — o jogo ser jogavel

Objetivo: implementar bombas, explosoes, power-ups, rounds e condicao de vitoria. O jogo precisa ser divertido antes de qualquer outra coisa.

**Onde implementar**: dentro do `server/` atual, no `server/src/services/game/data.ts`. Nao extrair para `gameserver/` ainda — queremos velocidade de iteracao, nao pureza arquitetural.

**Entregas**:

| # | Entrega |
|---|---|
| 1.1 | Grid 15x15 com paredes (xadrez) e caixas destrutiveis (40%). Spawns nos cantos. |
| 1.2 | Colocar bomba: comando do cliente → servidor valida (tem bomba disponivel?) → instancia bomba com owner, timer (3s), alcance. |
| 1.3 | Tick fixo 20tps. Game loop processa: mover jogadores, tick de bombas, explosoes, coleta de power-ups. |
| 1.4 | Explosoes: propagacao em cruz, para em paredes, destroi caixas, detona bombas em cadeia, mata jogadores. |
| 1.5 | Power-ups: drop ao destruir caixa (60%). Tipos: Bomba+, Alcance+, Velocidade+, Kick. Stackaveis. |
| 1.6 | Sistema de vidas (2 por jogador), respawn com invulnerabilidade (2s). |
| 1.7 | Condicao de vitoria: ultimo sobrevivente vence o round. Melhor de 3 rounds. |
| 1.8 | Morte subita: mapa encolhe borda a cada 5s quando timer de round esgota. |
| 1.9 | Testes deterministicos de regra: bomba explode, explosao propaga, power-up dropa, round termina. |

**Criterio de saida**: duas pessoas conseguem jogar uma partida de Bomberman funcional com bombas, explosoes, power-ups e vencedor declarado.

---

### Fase 2: Persistencia — migrar para Postgres

Objetivo: contas, sessoes e historico de partidas passam a viver em Postgres. JSON files sao removidos do runtime.

**Entregas**:

| # | Entrega |
|---|---|
| 2.1 | Ativar `server/src/clients/postgres/index.ts` como camada de dados principal. |
| 2.2 | Migrar schema `sql/constructor.sql`: corrigir FK de `characters`, adicionar tabelas de progressao (`user_progression`, `user_currency`, `user_cosmetics`, `match_results`). |
| 2.3 | Introduzir sistema de migrations (ex: `node-pg-migrate` ou scripts sequenciais versionados). |
| 2.4 | Migrar `users` e `sessions` do banco em arquivo para Postgres. |
| 2.5 | Persistir resultado de partida: `match_results` com `match_id`, `user_id`, `rounds_won`, `kills`, `deaths`, `boxes_destroyed`, `powerups_collected`, `winner`, `xp_earned`. |
| 2.6 | Descontinuar `server/src/database/index.ts` e remover dependencia de `server/data/`. |
| 2.7 | Seed data: 3-5 mapas base, personagem padrao, cosmeticos iniciais. |

**Criterio de saida**: `server/` sobe sem a pasta `server/data/`. Resultado de partida persiste e e consultavel.

---

### Fase 3: Pos-partida e progressao

Objetivo: fechar o loop da sessao do jogador com tela de resultado, progressao de conta e leaderboard.

**Entregas**:

| # | Entrega |
|---|---|
| 3.1 | Tela de pos-partida no client: vencedor, stats individuais, XP ganho, moeda ganha. |
| 3.2 | Sistema de niveis: XP por partida, formula `100 * nivel`, recompensas por nivel. |
| 3.3 | Moeda virtual (Ouro): ganho por partida, armazenado no perfil. |
| 3.4 | Leaderboard simples: top 100 por vitorias (global) e top 50 por modo. |
| 3.5 | Historico de partidas: ultimas 20 partidas com stats basicos. |
| 3.6 | Perfil do jogador: nivel, stats agregados (total de partidas, kills, vitorias), conquistas basicas. |

**Criterio de saida**: jogador termina partida → ve resultado → ve XP subir → confere perfil → volta ao lobby.

---

### Fase 4: Social e retencao

Objetivo: adicionar camadas de retencao e monetizacao.

**Entregas**:

| # | Entrega |
|---|---|
| 4.1 | Party system: criar sala com room code de 6 digitos, amigos entram via `/join/<code>`. |
| 4.2 | Guest play: jogar sem cadastro, personagem padrao, progresso nao salvo. Banner para criar conta. |
| 4.3 | Loja de cosmeticos: skins de personagem (ouro + gemas). |
| 4.4 | Sistema de gemas (moeda premium): pacotes de R$5 a R$100. Integracao com gateway de pagamento. |
| 4.5 | Daily rewards: bonus diario crescente (1-7 dias). |
| 4.6 | Missoes diarias e semanais: tarefas simples com recompensa em XP e ouro. |
| 4.7 | Sistema de conquistas: achievements com badges e recompensas. |
| 4.8 | Social login: Google e Discord. |

**Criterio de saida**: jogador convida amigo via room code, ambos jogam, ganham recompensas diarias, compram skin na loja.

---

### Fase 5: Extrair gameserver como runtime autoritativo

Objetivo: mover o game loop de `server/` para `gameserver/` com Colyseus. Separar plataforma de runtime.

**Entregas**:

| # | Entrega |
|---|---|
| 5.1 | Configurar Colyseus no `gameserver/` com uma room por partida. |
| 5.2 | Migrar logica de jogo (bombas, explosoes, power-ups, rounds) do `server/src/services/game/data.ts` para schema Colyseus. |
| 5.3 | Substituir Socket.IO ad-hoc do game loop por state sync do Colyseus. |
| 5.4 | Ticket de entrada: `server/` emite token temporario de partida → client conecta no `gameserver/`. |
| 5.5 | Reconexao automatica: jogador reconecta em ate 30s sem perder estado. |
| 5.6 | `gameserver/` reporta resultado final da partida para `server/` via HTTP. |
| 5.7 | Remover `server/src/services/game/data.ts` e codigo de jogo restante do `server/`. |

**Criterio de saida**: `server/` nao contem mais logica de simulacao de jogo. Partidas rodam exclusivamente no `gameserver/`.

---

### Fase 6: Consolidar cliente de partida

Objetivo: eliminar duplicacao de cliente de jogo. `game/` ou `client/` viram o unico frontend da partida.

**Entregas**:

| # | Entrega |
|---|---|
| 6.1 | Decidir: reescrever `game/` como modulo dentro do build do `client/` (recomendado: evita dois repositorios mentais). |
| 6.2 | Adotar PixiJS para renderizacao 2D (substitui canvas manual). |
| 6.3 | Adaptar cliente para state sync do Colyseus. |
| 6.4 | Input local com predict visual, validado pelo servidor. |
| 6.5 | Remover `client/src/components/Game.ts` e codigo de jogo legado do `client/`. |

**Criterio de saida**: existe um unico cliente de partida, renderizado com PixiJS, sincronizado com Colyseus.

---

### Fase 7: Ranked, seasons e Battle Pass

Objetivo: camada competitiva e monetizacao recorrente.

**Entregas**:

| # | Entrega |
|---|---|
| 7.1 | Sistema de Elo por modo de jogo. |
| 7.2 | Tiers visuais: Bronze, Prata, Ouro, Platina, Diamante, Mestre. |
| 7.3 | Seasons de 8 semanas com reset parcial e recompensas. |
| 7.4 | Battle Pass com free e premium track. |
| 7.5 | Eventos sazonais: mapas e cosmeticos tematicos (Halloween, Natal). |

**Criterio de saida**: jogador compete em ranked, sobe de tier, compra battle pass, coleta recompensas sazonais.

---

### Fase 8: Admin Studio de conteudo

Objetivo: ferramenta visual para criar e gerenciar assets, mapas e conteudo do jogo sem editar JSON manualmente.

**Nota**: esta fase so faz sentido quando houver volume de conteudo que justifique a ferramenta. Para o MVP, mapas commitados em `.tmj` no repositorio sao suficientes.

**Entregas**:

| # | Entrega |
|---|---|
| 8.1 | Admin autenticado em `/admin` com controle de papeis (designer, revisor, admin). |
| 8.2 | Upload de assets para SeaweedFS com validacao de tipo, tamanho e hash. |
| 8.3 | Editor de tiles e tilesets com propriedades (`solid`, `destructible`, `spawnAllowed`). |
| 8.4 | Editor de mapas visual com grid, paleta, ferramentas de pintura e validacao em tempo real. |
| 8.5 | Versionamento de conteudo: draft → review → published → archived. Publicacao e imutavel. |
| 8.6 | Grafo de dependencias: mapa referencia tileset@version → tile@version → asset@version. |
| 8.7 | Export Tiled-compatible (`.tmj`/`.tsj`) para interoperabilidade. |
| 8.8 | `gameserver/` consome pacotes publicados via SeaweedFS. |

**Criterio de saida**: designer cria mapa novo no admin, publica, e a proxima partida sorteia o mapa sem depender de arquivo local.

---

### Fora do roadmap atual (avaliar depois)

**Agones** (Kubernetes dedicated game servers): relevante quando houver dezenas de milhares de CCU e for necessario alocar/reciclar instancias de `gameserver` dinamicamente. Com Colyseus + RedisPresence, uma unica instancia escala ate milhares de jogadores simultaneos. Nao e necessario antes disso.

**Nakama** (backend as a service para jogos): oferece auth, storage, leaderboards, matchmaker e multiplayer prontos. Pode acelerar features de plataforma se a manutencao do backend custom ficar pesada demais. Neste cenario, substituiria parcialmente `server/`. Avaliar apos a Fase 5, quando a extracao do game loop estiver concluida e a dor da plataforma custom for mensuravel.

## Decisoes tecnicas

### Stack recomendada por camada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Cliente de partida** | PixiJS v8 + TypeScript | Renderizacao 2D madura, WebGL com fallback, ecossistema ativo. Substitui canvas manual atual. |
| **UI web** | React + Vite + Tailwind | Ja esta no projeto. Manter. |
| **Plataforma (server)** | Express + Socket.IO + Postgres | Ja esta no projeto. Migrar persistence para Postgres, manter HTTP e Socket.IO para matchmaking/orquestracao. |
| **Runtime de partida (gameserver)** | Colyseus v0.17 | Rooms nativas, state sync, reconexao, RedisPresence, TypeScript full-stack. Encaixe natural para partidas autoritativas. |
| **Banco permanente** | Postgres 16 | Contas, progresso, historico, cosmeticos, catalogo de conteudo. |
| **Cache/presenca** | Redis | Sessoes de matchmaking, presence, fila de tickets. Ja esta no docker-compose. |
| **Object storage** | SeaweedFS | S3-compatible, ativo (v4.28, mai/2026). Assets, mapas publicados, uploads. Ja esta no docker-compose. |
| **Infra de escala** | Docker Compose → Kubernetes (futuro) | Comecar com compose. Migrar para k8s + Agones apenas quando necessario. |

### O que NAO introduzir agora

- **Agones**: sem `gameserver` real, nao ha o que alocar. Prematuro.
- **Nakama**: reescreveria toda a plataforma. Risco de distracao antes do core loop existir.
- **Microservicos distribudos**: monorepo com 2-3 servicos (`server`, `gameserver`, `client`) e suficiente. Nao divida antes da dor existir.
- **Prediction/rollback no cliente**: Bomberman e tolerante a latencia. State sync simples + interpolacao resolve. Otimize depois.

### O que substituir na codebase atual

| Area atual | Problema | Substituicao | Quando |
|---|---|---|---|
| `server/src/services/game/data.ts` | Game loop acoplado a plataforma | `gameserver/` com Colyseus | Fase 5 |
| `server/src/database/index.ts` | Persistencia em JSON files | Postgres com migrations | Fase 2 |
| Eventos Socket.IO ad-hoc | Contrato fragil | Schema tipado Colyseus + constantes compartilhadas | Fase 0 + Fase 5 |
| `client/src/components/Game.ts` | Canvas manual, duplicado com `game/` | PixiJS no client consolidado | Fase 6 |
| `game/` (prototipo standalone) | WebSocket nativo, fora do fluxo | Incorporado ao `client/` com Colyseus | Fase 6 |

## Referencias

### Nota de validacao (maio 2026)

| Tecnologia | Versao | Status |
|---|---|---|
| Colyseus | v0.17 (fev 2026) | Ativo, 6.9k stars. Pre-1.0, estavel, migration guide. |
| PixiJS | v8.x | Ativo. Padrao para 2D web. |
| SeaweedFS | v4.28 (mai 2026) | Ativo, 32.4k stars. S3-compatible, Apache 2.0. |
| Postgres | 16 | Estavel, LTS. |
| Redis | 7.x (redis-stack) | Estavel. |
| Tiled | v1.12.1 (mar 2026) | Ativo, 12.6k stars. Formato `.tmj` estavel. |
| Agones | v1.58.0 (mai 2026) | Ativo, CNCF. Avaliar apenas pos-Fase 5. |
| Nakama | v3.39.0 (mai 2026) | Ativo, 12.6k stars. Avaliar apenas pos-Fase 5. |
| MinIO | Arquivado abr 2026 | Nao usar. Substituido por SeaweedFS. |

### Referencias conceituais

- **Glenn Fiedler / Gaffer On Games**: modelo de rede para jogos de acao, servidor autoritativo, state sync vs prediction.
- **Colyseus docs**: rooms, state synchronization, RedisPresence, reconnection.
- **Tiled docs**: formato `.tmj`, tile layers, object layers, custom properties.

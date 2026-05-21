# SQL

## Papel

- `start.sql` cria o banco `bombermanos` e inclui `constructor.sql`.
- `constructor.sql` define o schema relacional inicial do projeto.

## Regras locais

- Edite scripts assumindo que eles ainda sao usados como bootstrap manual de ambiente.
- O runtime principal do backend atual ainda nao depende 100% deste schema.
- Preserve compatibilidade com o fluxo `psql -f sql/start.sql`.
- Existe uma referencia a `characters(id)` sem criacao da tabela correspondente; trate isso como caveat conhecido ao alterar FKs.

## Verificacao

- Revise cuidadosamente a ordem de criacao de tabelas e FKs.
- Se mudar o schema, atualize `README.md` e `docs/development.md` quando o setup local mudar.

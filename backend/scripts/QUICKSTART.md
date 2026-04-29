# Guia Rápido - Popular Banco de Dados

## Passo 1: Instalar Dependências

```bash
cd backend
pip install faker
```

## Passo 2: Testar Conexão

```bash
python scripts/test_db_connection.py
```

Se aparecer: `✓ Conexão com o banco de dados estabelecida com sucesso!`, pode continuar.

## Passo 3: Popular Banco de Dados

```bash
python scripts/populate_db.py
```

## Resultado Esperado

O script irá criar:
- 15 clientes com CPFs válidos
- 15 advogados com OABs válidos
- 15 processos vinculados a clientes e advogados
- 15 devedores vinculados a processos

## Troubleshooting

**Erro: "No module named 'faker'"**
```bash
pip install faker
```

**Erro: "Connection refused"**
- Verifique se o PostgreSQL está rodando
- Verifique as configurações em `.env`

**Erro: "Database does not exist"**
```bash
# Criar banco de dados
createdb gestao_juridica

# Ou via Docker
docker exec -it postgres psql -U postgres -c "CREATE DATABASE gestao_juridica;"
```

**Erro: "Relation does not exist"**
```bash
# Aplicar migrações
flask db upgrade
```
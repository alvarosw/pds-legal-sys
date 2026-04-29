# Scripts de População do Banco de Dados

Este diretório contém scripts para popular o banco de dados com dados de teste.

## populate_db.py

Script principal para popular o banco de dados com dados de teste realistas.

### Funcionalidades

- Gera 15 registros de cada entidade:
  - Clientes
  - Advogados
  - Processos
  - Devedores

- Cria dados válidos:
  - CPFs válidos (algoritmo módulo 11)
  - CNPJs válidos
  - OABs válidos (com UF)
  - Telefones formatados
  - Endereços e e-mails realistas

- Mantém integridade referencial:
  - Processos vinculados a clientes e advogados existentes
  - Devedores vinculados a processos existentes

### Pré-requisitos

1. Banco de dados PostgreSQL rodando
2. Ambiente virtual ativado
3. Dependências instaladas

### Instalação de Dependências

```bash
cd backend
pip install -r requirements.txt
```

### Como Usar

```bash
# Ativar ambiente virtual (Windows)
venv\Scripts\activate

# Ativar ambiente virtual (Linux/macOS)
source venv/bin/activate

# Executar script de população
python scripts/populate_db.py
```

### O que o script faz

1. **Limpa dados existentes** (opcional - pode ser comentado)
2. **Cria 15 clientes** com CPFs válidos
3. **Cria 15 advogados** com OABs válidos
4. **Cria 15 processos** vinculados a clientes e advogados
5. **Cria 15 devedores** vinculados a processos

### Saída Esperada

```
============================================================
Script de População do Banco de Dados
============================================================

Limpando dados existentes...
✓ Dados existentes removidos!

Criando 15 clientes...
✓ 15 clientes criados com sucesso!

Criando 15 advogados...
✓ 15 advogados criados com sucesso!

Criando 15 processos...
✓ 15 processos criados com sucesso!

Criando 15 devedores...
✓ 15 devedores criados com sucesso!

============================================================
Resumo da População
============================================================
Clientes: 15
Advogados: 15
Processos: 15
Devedores: 15
============================================================
✓ Banco de dados populado com sucesso!
```

### Personalização

Para alterar a quantidade de registros, modifique os parâmetros na função `main()`:

```python
clientes = populate_clientes(20)  # Criar 20 clientes
advogados = populate_advogados(20)  # Criar 20 advogados
processos = populate_processos(clientes, advogados, 20)  # Criar 20 processos
devedores = populate_devedores(processos, 20)  # Criar 20 devedores
```

### Notas Importantes

- O script usa a biblioteca `faker` para gerar dados realistas em português
- Todos os CPFs, CNPJs e OABs são matematicamente válidos
- O script limpa os dados existentes antes de criar novos
- Para preservar dados existentes, comente as linhas de deleção na função `main()`

### Solução de Problemas

**Erro de conexão com o banco de dados:**
- Verifique se o PostgreSQL está rodando
- Verifique as configurações em `.env`

**Erro de módulo não encontrado:**
- Certifique-se de estar no diretório `backend`
- Ative o ambiente virtual
- Instale as dependências: `pip install -r requirements.txt`

**Erro de permissão:**
- Verifique se o usuário do banco de dados tem permissões de escrita
- Verifique se as variáveis de ambiente estão configuradas corretamente
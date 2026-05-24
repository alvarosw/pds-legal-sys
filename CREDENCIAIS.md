# Credenciais de Acesso

Este arquivo contém as credenciais de desenvolvimento para o Sistema de Gestão Jurídica.

## Status do Teste no Banco de Dados

- [x] PostgreSQL rodando no Docker
- [x] Migration `create_usuarios` aplicada com sucesso
- [x] Script `create_admin.py` executado com sucesso
- [x] Login do admin testado e funcionando
- [x] Login do tester testado e funcionando
- [x] Token JWT sendo gerado corretamente
- [x] Rota protegida `/usuarios` testada com token

## Usuários Cadastrados

| Perfil  | Email              | Senha     | Permissões              |
|---------|--------------------|-----------|-------------------------|
| Admin   | admin@email.com    | admin123  | Acesso completo + admin |
| Teste   | tester@email.com   | tester123 | Acesso padrão (sem admin) |

## Criando Novos Usuários

Para criar novos usuários, execute o script de seed:

```bash
cd backend
python scripts/create_admin.py
```

## Fluxo de Autenticação

1. Acesse a página de login em `/login`
2. Digite o email e senha de um dos usuários acima
3. O sistema irá salvar o token JWT no localStorage
4. Todas as requisições subsequentes incluirão o token automaticamente
5. Ao fazer logout, o token é removido e o usuário é redirecionado para o login
# Backend — API Flask

API REST para o Sistema de Gestão Jurídica.

## Autenticação

O backend implementa autenticação via JWT (JSON Web Tokens) usando PyJWT e bcrypt para hash de senhas.

### Novo Módulo: Usuário

- **Model:** `app/models/usuario.py` - Model de Usuário com hash de senha (bcrypt)
- **Schema:** `app/schemas/usuario.py` - UsuarioSchema, UsuarioCreateSchema, LoginSchema
- **Repository:** `app/repositories/usuario_repo.py` - CRUD de usuários
- **Service:** `app/services/auth_service.py` - Login e gestão de usuários
- **Controller:** `app/controllers/auth_bp.py` - Rotas de autenticação

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Realizar login e obter token JWT |
| GET | `/usuarios` | Listar usuários (protegido) |
| POST | `/usuarios` | Criar usuário (protegido) |

### Middleware de Autenticação

O arquivo `app/middleware/auth.py` contém:

- `generate_token()`: Gera token JWT com expiração de 24h
- `decode_token()`: Valida e decodifica o token
- `token_required`: Decorator para proteger rotas
- `admin_required`: Decorator para rotas exclusivas de admin

### Scripts Úteis

```bash
# Criar usuários iniciais (admin e tester)
python scripts/create_admin.py
```

### Credenciais Padrão

| Perfil | Email | Senha |
|--------|-----|-------|
| Admin | admin@email.com | admin123 |
| Tester | tester@email.com | tester123 |

---

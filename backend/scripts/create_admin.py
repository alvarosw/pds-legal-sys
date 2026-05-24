#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar usuário admin no banco de dados.
"""

import sys
import os
import io

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.usuario import Usuario


def create_admin(nome, email, senha, eh_admin=True):
    """Cria um usuário admin."""
    usuario = Usuario(
        nome=nome,
        email=email,
        eh_admin=eh_admin,
        ativo=True
    )
    usuario.set_senha(senha)
    db.session.add(usuario)
    db.session.commit()
    return usuario


def main():
    """Função principal para criar usuários admin."""
    print("=" * 60)
    print("Criação de Usuários Admin")
    print("=" * 60)
    print()

    app = create_app()

    with app.app_context():
        # Verifica se já existe admin
        existing_admin = Usuario.query.filter_by(eh_admin=True).first()
        if existing_admin:
            print(f"Já existe um admin cadastrado: {existing_admin.email}")
            print()

        # Cria admin principal
        admin_email = "admin@email.com"
        admin_senha = "admin123"

        existing = Usuario.query.filter_by(email=admin_email).first()
        if existing:
            print(f"Usuario {admin_email} ja existe (ID: {existing.id})")
        else:
            admin = create_admin("Administrador Principal", admin_email, admin_senha)
            print(f"Admin criado: {admin.email} (ID: {admin.id})")

        # Cria usuario de teste
        tester_email = "tester@email.com"
        tester_senha = "tester123"

        existing = Usuario.query.filter_by(email=tester_email).first()
        if existing:
            print(f"Usuario {tester_email} ja existe (ID: {existing.id})")
        else:
            tester = create_admin("Usuario de Teste", tester_email, tester_senha, eh_admin=False)
            print(f"Usuario criado: {tester.email} (ID: {tester.id})")

        print()
        print("=" * 60)
        print("Resumo de Usuarios Criados")
        print("=" * 60)

        usuarios = Usuario.query.all()
        for u in usuarios:
            print(f"  - {u.nome} ({u.email}) - Admin: {u.eh_admin}")

        print()
        print("Credenciais de acesso:")
        print(f"  Admin: {admin_email} / {admin_senha}")
        print(f"  Tester: {tester_email} / {tester_senha}")
        print("=" * 60)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"✗ Erro ao criar admin: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de teste rápido para verificar a conexão com o banco de dados.
"""

import sys
import os
import io

# Configurar stdout para UTF-8
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db


def test_connection():
    """Testa a conexão com o banco de dados."""
    print("Testando conexão com o banco de dados...")

    try:
        app = create_app()

        with app.app_context():
            # Tenta executar uma query simples
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1")).scalar()

            if result == 1:
                print("✓ Conexão com o banco de dados estabelecida com sucesso!")
                return True
            else:
                print("✗ Conexão estabelecida, mas resultado inesperado.")
                return False

    except Exception as e:
        print(f"✗ Erro ao conectar ao banco de dados: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
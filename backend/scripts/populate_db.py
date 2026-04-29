#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para popular a base de dados com dados de teste.
Gera 15 registros de cada entidade: clientes, advogados, devedores e processos.
"""

import sys
import os
import io
import random
from datetime import datetime, timedelta
from faker import Faker

# Configurar stdout para UTF-8
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.cliente import Cliente
from app.models.advogado import Advogado
from app.models.processo import Processo
from app.models.devedor import Devedor

# Inicializar Faker em português
fake = Faker('pt_BR')


def generate_valid_cpf():
    """Gera um CPF válido usando o algoritmo do módulo 11."""
    # Gerar 9 dígitos aleatórios
    cpf = [random.randint(0, 9) for _ in range(9)]

    # Calcular primeiro dígito verificador
    total = sum((10 - i) * cpf[i] for i in range(9))
    remainder = total % 11
    digit1 = 0 if remainder < 2 else 11 - remainder
    cpf.append(digit1)

    # Calcular segundo dígito verificador
    total = sum((11 - i) * cpf[i] for i in range(10))
    remainder = total % 11
    digit2 = 0 if remainder < 2 else 11 - remainder
    cpf.append(digit2)

    # Formatar CPF
    cpf_str = ''.join(map(str, cpf))
    return f"{cpf_str[:3]}.{cpf_str[3:6]}.{cpf_str[6:9]}-{cpf_str[9:]}"


def generate_valid_cnpj():
    """Gera um CNPJ válido."""
    # Gerar 12 dígitos aleatórios
    cnpj = [random.randint(0, 9) for _ in range(12)]

    # Calcular primeiro dígito verificador
    weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(weights[i] * cnpj[i] for i in range(12))
    remainder = total % 11
    digit1 = 0 if remainder < 2 else 11 - remainder
    cnpj.append(digit1)

    # Calcular segundo dígito verificador
    weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    total = sum(weights[i] * cnpj[i] for i in range(13))
    remainder = total % 11
    digit2 = 0 if remainder < 2 else 11 - remainder
    cnpj.append(digit2)

    # Formatar CNPJ
    cnpj_str = ''.join(map(str, cnpj))
    return f"{cnpj_str[:2]}.{cnpj_str[2:5]}.{cnpj_str[5:8]}/{cnpj_str[8:12]}-{cnpj_str[12:]}"


def generate_valid_oab():
    """Gera um número de OAB válido com UF."""
    ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
    uf = random.choice(ufs)
    numero = random.randint(10000, 999999)
    return f"{numero}/{uf}"


def generate_valid_phone():
    """Gera um número de telefone válido."""
    ddd = random.randint(11, 99)
    numero = f"{random.randint(90000, 99999)}-{random.randint(1000, 9999)}"
    return f"({ddd}) {numero}"


def populate_clientes(count=15):
    """Popula a tabela de clientes."""
    print(f"Criando {count} clientes...")

    clientes = []
    for i in range(count):
        cliente = Cliente(
            nome_completo=fake.name(),
            cpf_cnpj=generate_valid_cpf(),
            telefone=generate_valid_phone(),
            email=fake.email(),
            endereco=fake.address().replace('\n', ', '),
            observacoes=fake.sentence() if random.random() > 0.5 else None,
            ativo=True
        )
        clientes.append(cliente)

    db.session.add_all(clientes)
    db.session.commit()
    print(f"✓ {count} clientes criados com sucesso!")
    return clientes


def populate_advogados(count=15):
    """Popula a tabela de advogados."""
    print(f"Criando {count} advogados...")

    advogados = []
    for i in range(count):
        advogado = Advogado(
            nome_completo=fake.name(),
            cpf=generate_valid_cpf(),
            numero_oab=generate_valid_oab(),
            telefone=generate_valid_phone(),
            email=fake.email(),
            especialidade=random.choice([
                'Direito Civil', 'Direito Penal', 'Direito Trabalhista',
                'Direito Tributário', 'Direito Empresarial', 'Direito de Família'
            ]),
            ativo=True
        )
        advogados.append(advogado)

    db.session.add_all(advogados)
    db.session.commit()
    print(f"✓ {count} advogados criados com sucesso!")
    return advogados


def populate_processos(clientes, advogados, count=15):
    """Popula a tabela de processos."""
    print(f"Criando {count} processos...")

    processos = []
    tipos = ['Cível', 'Criminal', 'Trabalhista', 'Tributário', 'Empresarial', 'Família']

    for i in range(count):
        processo = Processo(
            numero_processo=f"{random.randint(1000000, 9999999)}-{random.randint(10, 99)}.{random.randint(1000, 9999)}.{random.randint(1, 9)}.{random.randint(10, 99)}",
            tipo=random.choice(tipos),
            data_abertura=fake.date_between(start_date='-2y', end_date='today'),
            cliente_id=random.choice(clientes).id,
            vara_comarca=f"{random.randint(1, 50)}ª Vara Cível de {fake.city()}",
            advogado_resp_id=random.choice(advogados).id,
            valor_causa=random.uniform(5000, 500000),
            status=random.choice(['Em andamento', 'Concluído', 'Suspenso', 'Arquivado']),
            observacoes=fake.sentence() if random.random() > 0.5 else None,
            ativo=True
        )
        processos.append(processo)

    db.session.add_all(processos)
    db.session.commit()
    print(f"✓ {count} processos criados com sucesso!")
    return processos


def populate_devedores(processos, count=15):
    """Popula a tabela de devedores."""
    print(f"Criando {count} devedores...")

    devedores = []

    for i in range(count):
        # 70% chance de ser pessoa física, 30% pessoa jurídica
        if random.random() > 0.3:
            nome = fake.name()
            cpf_cnpj = generate_valid_cpf()
        else:
            nome = fake.company()
            cpf_cnpj = generate_valid_cnpj()

        devedor = Devedor(
            nome_razao_social=nome,
            cpf_cnpj=cpf_cnpj,
            valor_divida=random.uniform(1000, 500000),
            data_divida=fake.date_between(start_date='-5y', end_date='today'),
            origem_descricao=fake.text(max_nb_chars=150),
            contato=generate_valid_phone(),
            processo_id=random.choice(processos).id,
            observacoes=fake.sentence() if random.random() > 0.5 else None,
            ativo=True
        )
        devedores.append(devedor)

    db.session.add_all(devedores)
    db.session.commit()
    print(f"✓ {count} devedores criados com sucesso!")
    return devedores


def main():
    """Função principal para popular o banco de dados."""
    print("=" * 60)
    print("Script de População do Banco de Dados")
    print("=" * 60)
    print()

    # Criar aplicação e contexto
    app = create_app()

    with app.app_context():
        # Limpar dados existentes (opcional)
        print("Limpando dados existentes...")
        Devedor.query.delete()
        Processo.query.delete()
        Advogado.query.delete()
        Cliente.query.delete()
        db.session.commit()
        print("✓ Dados existentes removidos!")
        print()

        # Popular tabelas em ordem de dependência
        clientes = populate_clientes(15)
        print()

        advogados = populate_advogados(15)
        print()

        processos = populate_processos(clientes, advogados, 15)
        print()

        devedores = populate_devedores(processos, 15)
        print()

        # Resumo
        print("=" * 60)
        print("Resumo da População")
        print("=" * 60)
        print(f"Clientes: {Cliente.query.count()}")
        print(f"Advogados: {Advogado.query.count()}")
        print(f"Processos: {Processo.query.count()}")
        print(f"Devedores: {Devedor.query.count()}")
        print("=" * 60)
        print("✓ Banco de dados populado com sucesso!")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"✗ Erro ao popular banco de dados: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
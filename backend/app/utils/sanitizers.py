"""Utilitários para sanitização e validação de campos numéricos.

Remove pontuações, espaços e traços, mantendo apenas os dígitos (e letras para OAB).
"""

import re


def sanitize_digits(value: str | None) -> str:
    """Remove todos os caracteres não numéricos de uma string."""
    if value is None:
        return ''
    return re.sub(r'\D', '', str(value))


def sanitize_cpf_cnpj(value: str | None) -> str:
    """Sanitiza CPF ou CNPJ, retornando apenas os dígitos."""
    return sanitize_digits(value)


def sanitize_phone(value: str | None) -> str:
    """Sanitiza telefone, retornando apenas os dígitos."""
    return sanitize_digits(value)


def sanitize_oab(value: str | None) -> str:
    """Sanitiza OAB, mantendo apenas letras (UF) e dígitos.
    
    Formato esperado: UF + números (ex: SP123456).
    """
    if value is None:
        return ''
    value = str(value).strip().upper()
    # Extrai apenas letras (UF) e dígitos
    letters = re.sub(r'[^A-Z]', '', value)
    numbers = re.sub(r'\D', '', value)
    return letters + numbers


def validate_cpf_cnpj(value: str | None) -> bool:
    """Valida CPF ou CNPJ já sanitizado (apenas dígitos)."""
    if value is None:
        return False
    digits = sanitize_digits(value)
    if len(digits) == 11:
        return _validate_cpf(digits)
    elif len(digits) == 14:
        return _validate_cnpj(digits)
    return False


def _validate_cpf(cpf: str) -> bool:
    """Valida CPF usando algoritmo módulo 11."""
    if len(cpf) != 11 or len(set(cpf)) == 1:
        return False

    # Calcula primeiro dígito verificador
    sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    remainder1 = (sum1 * 10) % 11
    d1 = 0 if remainder1 == 10 else remainder1

    if d1 != int(cpf[9]):
        return False

    # Calcula segundo dígito verificador
    sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    remainder2 = (sum2 * 10) % 11
    d2 = 0 if remainder2 == 10 else remainder2

    return d2 == int(cpf[10])


def _validate_cnpj(cnpj: str) -> bool:
    """Valida CNPJ usando algoritmo módulo 11."""
    if len(cnpj) != 14 or len(set(cnpj)) == 1:
        return False

    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    # Calcula primeiro dígito verificador
    sum1 = sum(int(cnpj[i]) * weights1[i] for i in range(12))
    remainder1 = sum1 % 11
    d1 = 0 if remainder1 < 2 else 11 - remainder1

    if d1 != int(cnpj[12]):
        return False

    # Calcula segundo dígito verificador
    sum2 = sum(int(cnpj[i]) * weights2[i] for i in range(13))
    remainder2 = sum2 % 11
    d2 = 0 if remainder2 < 2 else 11 - remainder2

    return d2 == int(cnpj[13])

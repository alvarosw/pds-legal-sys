def validate_cpf(cpf: str) -> bool:
    """Valida CPF usando algoritmo módulo 11."""
    digits = ''.join(c for c in cpf if c.isdigit())
    if len(digits) != 11 or len(set(digits)) == 1:
        return False
    for i in range(9, 11):
        value = sum(int(digits[j]) * ((i + 1) - j) for j in range(i))
        digit = ((value * 10) % 11) % 10
        if digit != int(digits[i]):
            return False
    return True


def validate_cnpj(cnpj: str) -> bool:
    """Valida CNPJ usando algoritmo módulo 11."""
    digits = ''.join(c for c in cnpj if c.isdigit())
    if len(digits) != 14 or len(set(digits)) == 1:
        return False
    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for weights, pos in [(weights1, 12), (weights2, 13)]:
        value = sum(int(digits[j]) * weights[j] for j in range(pos))
        digit = (value % 11)
        digit = 0 if digit < 2 else 11 - digit
        if digit != int(digits[pos]):
            return False
    return True


def validate_oab(oab: str) -> bool:
    """Valida formato básico de OAB (UF + números)."""
    import re
    return bool(re.match(r'^[A-Z]{2}\d{4,7}$', oab.upper().replace(' ', '')))

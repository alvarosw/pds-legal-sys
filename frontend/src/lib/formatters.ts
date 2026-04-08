/**
 * Utilitários de formatação para exibição de campos numéricos.
 * Recebem a string numérica crua (ex: "12345678900") e retornam com máscara visual.
 */

export function formatCPF(value: string | undefined | null): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return value
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(value: string | undefined | null): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 14) return value
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCPFOrCNPJ(value: string | undefined | null): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11) return formatCPF(digits)
  if (digits.length === 14) return formatCNPJ(digits)
  return value
}

export function formatPhone(value: string | undefined | null): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return value
}

export function formatOAB(value: string | undefined | null): string {
  if (!value) return ''
  const cleaned = value.replace(/\s/g, '').toUpperCase()
  const match = cleaned.match(/^([A-Z]{2})(\d+)$/)
  if (match) {
    return `${match[1]} ${match[2]}`
  }
  return cleaned
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return ''
  const date = new Date(value + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

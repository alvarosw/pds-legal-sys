import { z } from 'zod'

// Valida apenas dígitos (número cru sem pontuação)
const digitsOnly = (field: string, minDigits: number, maxDigits: number) =>
  z.string()
    .refine((val) => /^\d+$/.test(val), `${field} deve conter apenas números`)
    .refine((val) => val.length >= minDigits && val.length <= maxDigits, `${field} inválido`)

export const clienteSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf_cnpj: digitsOnly('CPF/CNPJ', 11, 14),
  telefone: digitsOnly('Telefone', 10, 11),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  observacoes: z.string().optional(),
})

export const advogadoSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  numero_oab: z.string()
    .refine((val) => /^[A-Z]{2}?\s*\d+$/.test(val.toUpperCase()), 'OAB deve estar no formato UF + números (ex: SP 123456 ou SP123456)'),
  cpf: digitsOnly('CPF', 11, 11),
  email: z.string().email('E-mail inválido'),
  telefone: digitsOnly('Telefone', 10, 11).optional().or(z.literal('')),
  especialidade: z.string().optional(),
})

export const devedorSchema = z.object({
  nome_razao_social: z.string().min(3, 'Nome/Razão Social deve ter pelo menos 3 caracteres'),
  cpf_cnpj: digitsOnly('CPF/CNPJ', 11, 14),
  valor_divida: z.coerce.number().positive('Valor da dívida deve ser positivo'),
  data_divida: z.string().refine((val) => {
    const date = new Date(val + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date <= today
  }, 'Data da dívida não pode ser futura'),
  origem_descricao: z.string().min(5, 'Origem/Descrição deve ter pelo menos 5 caracteres'),
  contato: z.string().optional(),
  processo_id: z.string().optional(),
  observacoes: z.string().optional(),
})

export const processoSchema = z.object({
  numero_processo: z.string().min(1, 'Número do processo é obrigatório'),
  tipo: z.string().min(1, 'Tipo do processo é obrigatório'),
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  data_abertura: z.string().min(1, 'Data de abertura é obrigatória'),
  vara_comarca: z.string().min(1, 'Vara/Comarca é obrigatória'),
  status: z.enum(['Aberto', 'Em Andamento', 'Suspenso', 'Encerrado', 'Arquivado']),
  advogado_resp_id: z.string().optional(),
  valor_causa: z.coerce.number().positive('Valor da causa deve ser positivo').optional().or(z.literal(0)),
  observacoes: z.string().optional(),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
export type AdvogadoFormData = z.infer<typeof advogadoSchema>
export type DevedorFormData = z.infer<typeof devedorSchema>
export type ProcessoFormData = z.infer<typeof processoSchema>

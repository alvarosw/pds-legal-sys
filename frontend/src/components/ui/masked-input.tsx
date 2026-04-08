import * as React from 'react'
import { cn } from '@/lib/utils'

type MaskType = 'cpf' | 'cnpj' | 'cpf_cnpj' | 'phone' | 'oab'

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  mask: MaskType
  value?: string
  onChange?: (rawValue: string) => void
}

const MASK_CONFIG: Record<MaskType, { maxLength: number }> = {
  cpf: { maxLength: 11 },
  cnpj: { maxLength: 14 },
  cpf_cnpj: { maxLength: 14 },
  phone: { maxLength: 11 },
  oab: { maxLength: 9 },
}

const applyMask = (value: string, mask: MaskType): string => {
  const digits = value.replace(/\D/g, '')
  const { maxLength } = MASK_CONFIG[mask]
  const limited = digits.substring(0, maxLength)

  switch (mask) {
    case 'cpf':
      return limited
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    case 'cnpj':
      return limited
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    case 'cpf_cnpj':
      if (limited.length <= 11) {
        return limited
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      }
      return limited
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    case 'phone':
      if (limited.length <= 10) {
        return limited
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
      }
      return limited
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    case 'oab':
      return limited.replace(/([A-Z]{2})(\d)/, '$1 $2')
    default:
      return limited
  }
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value: rawValue, onChange, className, ...props }, ref) => {
    const maxLength = MASK_CONFIG[mask].maxLength
    const [displayValue, setDisplayValue] = React.useState(() => 
      applyMask(String(rawValue || ''), mask)
    )

    // Sincroniza display quando o valor externo muda
    React.useEffect(() => {
      setDisplayValue(applyMask(String(rawValue || ''), mask))
    }, [rawValue, mask])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value
      const raw = mask === 'oab'
        ? inputVal.replace(/[^A-Za-z0-9]/g, '').substring(0, maxLength).toUpperCase()
        : inputVal.replace(/\D/g, '').substring(0, maxLength)
      
      const formatted = applyMask(raw, mask)
      setDisplayValue(formatted)
      
      // Chama onChange com o valor cru
      onChange?.(raw)
    }

    return (
      <input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
MaskedInput.displayName = 'MaskedInput'

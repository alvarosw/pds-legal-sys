import * as React from 'react'
import { cn } from '@/lib/utils'

type MaskedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  masks: string[]
  value?: string
  onChange?: (rawValue: string) => void
}

type MaskToken = {
  type: 'digit' | 'upper' | 'lower' | 'fixed'
  char?: string
}

const parseMask = (mask: string): MaskToken[] => {
  return mask.split('').map((char) => {
    if (char === '0') return { type: 'digit' }
    if (char === 'X') return { type: 'upper' }
    if (char === 'x') return { type: 'lower' }
    return { type: 'fixed', char }
  })
}

const countValidSlots = (tokens: MaskToken[]) =>
  tokens.filter((t) => t.type !== 'fixed').length

const applyMask = (raw: string, tokens: MaskToken[]) => {
  let result = ''
  if (!raw) return result

  let rawIndex = 0

  for (const token of tokens) {
    if (token.type === 'fixed') {
      result += token.char
      continue
    }

    const char = raw[rawIndex]
    if (!char) break

    result += char
    rawIndex++
  }

  return result
}

const sanitizeRaw = (input: string, tokens: MaskToken[]) => {
  const clean = input.replace(/[^a-zA-Z0-9]/g, '')
  const result: string[] = []

  let i = 0

  for (const token of tokens) {
    if (token.type === 'fixed') continue

    const char = clean[i]
    if (!char) break

    if (token.type === 'digit' && /\d/.test(char)) {
      result.push(char)
      i++
    } else if (token.type === 'upper' && /[a-zA-Z]/.test(char)) {
      result.push(char.toUpperCase())
      i++
    } else if (token.type === 'lower' && /[a-zA-Z]/.test(char)) {
      result.push(char.toLowerCase())
      i++
    } else {
      i++ // ignora inválido
    }
  }

  return result.join('')
}

const pickMask = (rawLength: number, parsedMasks: { tokens: MaskToken[]; size: number }[]) => {
  const exact = parsedMasks.find((m) => m.size === rawLength)
  if (exact) return exact

  const bigger = parsedMasks
    .filter((m) => m.size >= rawLength)
    .sort((a, b) => a.size - b.size)[0]

  if (bigger) return bigger

  return parsedMasks.sort((a, b) => b.size - a.size)[0]
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ masks, value, onChange, className, ...props }, ref) => {
    const parsedMasks = React.useMemo(() => {
      return masks
        .map((mask) => {
          const tokens = parseMask(mask)
          return {
            tokens,
            size: countValidSlots(tokens),
          }
        })
        .sort((a, b) => a.size - b.size)
    }, [masks])

    const maxLength = parsedMasks[parsedMasks.length - 1]?.size ?? 0

    const [displayValue, setDisplayValue] = React.useState('')

    React.useEffect(() => {
      const raw = (value || '').slice(0, maxLength)
      const mask = pickMask(raw.length, parsedMasks)
      const formatted = applyMask(raw, mask.tokens)
      setDisplayValue(formatted)
    }, [value, parsedMasks, maxLength])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value

      // usa maior máscara pra sanitizar entrada
      const biggestMask = parsedMasks[parsedMasks.length - 1]
      const raw = sanitizeRaw(input, biggestMask.tokens).slice(0, maxLength)

      const mask = pickMask(raw.length, parsedMasks)
      const formatted = applyMask(raw, mask.tokens)

      setDisplayValue(formatted)
      onChange?.(raw)
    }

    return (
      <input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          className
        )}
        {...props}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'
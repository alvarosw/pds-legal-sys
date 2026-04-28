import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import { LabelWithTooltip } from '@/components/ui/label-with-tooltip'
import { clienteSchema, type ClienteFormData } from '@/schemas'
import { createCliente, getErrorMessage } from '@/services/cliente.service'

export function ClienteCriacaoPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  })

  const onSubmit = async (data: ClienteFormData) => {
    try {
      await createCliente({
        ...data,
        observacoes: data.observacoes || undefined,
        email: data.email || undefined,
      })
      navigate('/clientes')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="px-6 py-4">
      <Header />
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome completo *</Label>
                <Input id="nome_completo" {...register('nome_completo')} />
                {errors.nome_completo && (
                  <p className="text-xs text-destructive">{errors.nome_completo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="cpf_cnpj"
                  tooltip="Informe o CPF (formato: 000.000.000-00) para pessoas físicas ou CNPJ (formato: 00.000.000/0000-00) para pessoas jurídicas"
                >
                  CPF/CNPJ *
                </LabelWithTooltip>
                <Controller
                  name="cpf_cnpj"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="cpf_cnpj"
                      masks={['000.000.000-00', '00.000.000/0000-00']}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="000.000.000-00"
                    />
                  )}
                />
                {errors.cpf_cnpj && (
                  <p className="text-xs text-destructive">{errors.cpf_cnpj.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="telefone"
                  tooltip="Informe o telefone com DDD. Aceita formato de celular (00) 00000-0000 ou fixo (00) 0000-0000"
                >
                  Telefone *
                </LabelWithTooltip>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="telefone"
                      masks={['(00) 00000-0000', '(00) 0000-0000']}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="(00) 0000-0000"
                    />
                  )}
                />
                {errors.telefone && (
                  <p className="text-xs text-destructive">{errors.telefone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="email"
                  tooltip="Endereço de e-mail para contato. Campo opcional, mas recomendado para comunicação"
                >
                  E-mail
                </LabelWithTooltip>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="endereco"
                  tooltip="Endereço completo do cliente: rua, número, bairro, cidade e estado"
                >
                  Endereço *
                </LabelWithTooltip>
                <Input id="endereco" {...register('endereco')} />
                {errors.endereco && (
                  <p className="text-xs text-destructive">{errors.endereco.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="observacoes"
                  tooltip="Informações adicionais sobre o cliente que possam ser úteis no atendimento"
                >
                  Observações
                </LabelWithTooltip>
                <Input id="observacoes" {...register('observacoes')} />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/clientes')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

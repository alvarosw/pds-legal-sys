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
                <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
                <Controller
                  name="cpf_cnpj"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="cpf_cnpj"
                      mask="cpf_cnpj"
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
                <Label htmlFor="telefone">Telefone *</Label>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="telefone"
                      mask="phone"
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
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input id="endereco" {...register('endereco')} />
                {errors.endereco && (
                  <p className="text-xs text-destructive">{errors.endereco.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
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

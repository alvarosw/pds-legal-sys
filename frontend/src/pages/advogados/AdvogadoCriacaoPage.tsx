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
import { advogadoSchema, type AdvogadoFormData } from '@/schemas'
import { createAdvogado, getErrorMessage } from '@/services/advogado.service'

export function AdvogadoCriacaoPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdvogadoFormData>({
    resolver: zodResolver(advogadoSchema),
  })

  const onSubmit = async (data: AdvogadoFormData) => {
    try {
      await createAdvogado({
        ...data,
        telefone: data.telefone || undefined,
        especialidade: data.especialidade || undefined,
      })
      navigate('/advogados')
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
            <CardTitle>Novo Advogado</CardTitle>
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
                <Label htmlFor="numero_oab">Número da OAB *</Label>
                <Controller
                  name="numero_oab"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="numero_oab"
                      mask="oab"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="SP0000000"
                    />
                  )}
                />
                {errors.numero_oab && (
                  <p className="text-xs text-destructive">{errors.numero_oab.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="cpf"
                      mask="cpf"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="000.000.000-00"
                    />
                  )}
                />
                {errors.cpf && (
                  <p className="text-xs text-destructive">{errors.cpf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="telefone"
                      mask="phone"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="(00) 00000-0000"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input id="especialidade" {...register('especialidade')} />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/advogados')}>
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

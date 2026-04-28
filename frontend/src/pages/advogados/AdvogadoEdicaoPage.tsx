import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import { LabelWithTooltip } from '@/components/ui/label-with-tooltip'
import { advogadoSchema, type AdvogadoFormData } from '@/schemas'
import {
  getAdvogadoById,
  updateAdvogado,
  getErrorMessage,
} from '@/services/advogado.service'

export function AdvogadoEdicaoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdvogadoFormData>({
    resolver: zodResolver(advogadoSchema),
  })

  useEffect(() => {
    if (!id) return
    const fetchAdvogado = async () => {
      try {
        const advogado = await getAdvogadoById(id)
        reset({
          nome_completo: advogado.nome_completo,
          numero_oab: advogado.numero_oab,
          cpf: advogado.cpf,
          email: advogado.email,
          telefone: advogado.telefone || '',
          especialidade: advogado.especialidade || '',
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchAdvogado()
  }, [id, reset])

  const onSubmit = async (data: AdvogadoFormData) => {
    if (!id) return
    try {
      await updateAdvogado(id, {
        ...data,
        telefone: data.telefone || undefined,
        especialidade: data.especialidade || undefined,
      })
      navigate('/advogados')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-4">
        <Header />
        <div className="px-6 pb-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      <Header />
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar Advogado</CardTitle>
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
                  htmlFor="numero_oab"
                  tooltip="Número de registro na OAB no formato UF + números (ex: SP123456 ou BA12345)"
                >
                  Número da OAB *
                </LabelWithTooltip>
                <Controller
                  name="numero_oab"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="numero_oab"
                      masks={['XX00000', 'XX000000']}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.numero_oab && (
                  <p className="text-xs text-destructive">{errors.numero_oab.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="cpf"
                  tooltip="CPF do advogado no formato 000.000.000-00"
                >
                  CPF *
                </LabelWithTooltip>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <MaskedInput
                      id="cpf"
                      masks={['000.000.000-00']}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.cpf && (
                  <p className="text-xs text-destructive">{errors.cpf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="email"
                  tooltip="Endereço de e-mail profissional para contato e comunicação oficial"
                >
                  E-mail *
                </LabelWithTooltip>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="telefone"
                  tooltip="Telefone de contato com DDD. Aceita formato de celular (00) 00000-0000 ou fixo (00) 0000-0000"
                >
                  Telefone
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
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="especialidade"
                  tooltip="Área de atuação do advogado (ex: Direito Civil, Direito Trabalhista, Direito Tributário)"
                >
                  Especialidade
                </LabelWithTooltip>
                <Input id="especialidade" {...register('especialidade')} />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate('/advogados')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
import { devedorSchema, type DevedorFormData } from '@/schemas'
import {
  getDevedorById,
  updateDevedor,
  getDevedorErrorMessage,
} from '@/services/devedor.service'

export function DevedorEdicaoPage() {
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
  } = useForm<DevedorFormData>({
    resolver: zodResolver(devedorSchema),
  })

  useEffect(() => {
    if (!id) return
    const fetchDevedor = async () => {
      try {
        const devedor = await getDevedorById(id)
        reset({
          nome_razao_social: devedor.nome_razao_social,
          cpf_cnpj: devedor.cpf_cnpj,
          valor_divida: devedor.valor_divida,
          data_divida: devedor.data_divida,
          origem_descricao: devedor.origem_descricao,
          contato: devedor.contato || '',
          processo_id: devedor.processo_id || '',
          observacoes: devedor.observacoes || '',
        })
      } catch (err) {
        setError(getDevedorErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchDevedor()
  }, [id, reset])

  const onSubmit = async (data: DevedorFormData) => {
    if (!id) return
    try {
      await updateDevedor(id, {
        nome_razao_social: data.nome_razao_social,
        cpf_cnpj: data.cpf_cnpj,
        valor_divida: data.valor_divida,
        data_divida: data.data_divida,
        origem_descricao: data.origem_descricao,
        contato: data.contato || undefined,
        processo_id: data.processo_id || undefined,
        observacoes: data.observacoes || undefined,
      })
      navigate('/devedores')
    } catch (err) {
      setError(getDevedorErrorMessage(err))
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
            <CardTitle>Editar Devedor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="nome_razao_social">Nome/Razão Social *</Label>
                <Input id="nome_razao_social" {...register('nome_razao_social')} />
                {errors.nome_razao_social && (
                  <p className="text-xs text-destructive">{errors.nome_razao_social.message}</p>
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
                  htmlFor="valor_divida"
                  tooltip="Valor total da dívida em reais. Deve ser maior que zero"
                >
                  Valor da Dívida *
                </LabelWithTooltip>
                <Input
                  id="valor_divida"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('valor_divida', { valueAsNumber: true })}
                />
                {errors.valor_divida && (
                  <p className="text-xs text-destructive">{errors.valor_divida.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="data_divida"
                  tooltip="Data em que a dívida foi contraída. Não pode ser uma data futura"
                >
                  Data da Dívida *
                </LabelWithTooltip>
                <Input
                  id="data_divida"
                  type="date"
                  {...register('data_divida')}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.data_divida && (
                  <p className="text-xs text-destructive">{errors.data_divida.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="origem_descricao"
                  tooltip="Descreva a origem da dívida (ex: contrato, nota fiscal, empréstimo) e detalhes relevantes"
                >
                  Origem/Descrição *
                </LabelWithTooltip>
                <Input id="origem_descricao" {...register('origem_descricao')} />
                {errors.origem_descricao && (
                  <p className="text-xs text-destructive">{errors.origem_descricao.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="contato"
                  tooltip="Telefone ou e-mail para contato com o devedor. Campo opcional"
                >
                  Contato (telefone ou e-mail)
                </LabelWithTooltip>
                <Input id="contato" {...register('contato')} />
                {errors.contato && (
                  <p className="text-xs text-destructive">{errors.contato.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="observacoes"
                  tooltip="Informações adicionais sobre a dívida ou o devedor que possam ser úteis"
                >
                  Observações
                </LabelWithTooltip>
                <Input id="observacoes" {...register('observacoes')} />
                {errors.observacoes && (
                  <p className="text-xs text-destructive">{errors.observacoes.message}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate('/devedores')}>
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

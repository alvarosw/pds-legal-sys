import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelWithTooltip } from '@/components/ui/label-with-tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { processoSchema, type ProcessoFormData } from '@/schemas'
import { createProcesso, getProcessoErrorMessage } from '@/services/processo.service'
import { getClientes } from '@/services/cliente.service'
import { getAdvogados } from '@/services/advogado.service'
import type { Cliente, Advogado } from '@/types'

export function ProcessoCriacaoPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [advogados, setAdvogados] = useState<Advogado[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProcessoFormData>({
    resolver: zodResolver(processoSchema),
    defaultValues: {
      status: 'Aberto',
      valor_causa: 0,
    },
  })

  const watchClienteId = watch('cliente_id')
  const watchAdvogadoId = watch('advogado_resp_id')

  useEffect(() => {
    getClientes({ page: 1, per_page: 100 }).then(r => setClientes(r.data)).catch(() => {})
    getAdvogados({ page: 1, per_page: 100 }).then(r => setAdvogados(r.data)).catch(() => {})
  }, [])

  const onSubmit = async (data: ProcessoFormData) => {
    try {
      await createProcesso({
        numero_processo: data.numero_processo,
        tipo: data.tipo,
        cliente_id: data.cliente_id,
        data_abertura: data.data_abertura,
        vara_comarca: data.vara_comarca,
        status: data.status,
        advogado_resp_id: data.advogado_resp_id || undefined,
        valor_causa: data.valor_causa || undefined,
        observacoes: data.observacoes || undefined,
      })
      navigate('/processos')
    } catch (err) {
      setError(getProcessoErrorMessage(err))
    }
  }

  const clienteSelecionado = clientes.find(c => c.id === watchClienteId)
  const advogadoSelecionado = advogados.find(a => a.id === watchAdvogadoId)

  return (
    <div className="px-6 py-4">
      <Header />
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="numero_processo"
                  tooltip="Número único de identificação do processo no tribunal (ex: 0000000-00.0000.0.00.0000)"
                >
                  Número do Processo *
                </LabelWithTooltip>
                <Input id="numero_processo" {...register('numero_processo')} />
                {errors.numero_processo && (
                  <p className="text-xs text-destructive">{errors.numero_processo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="tipo"
                  tooltip="Classificação do processo (ex: Cível, Trabalhista, Criminal, Tributário, Família)"
                >
                  Tipo do Processo *
                </LabelWithTooltip>
                <Input id="tipo" {...register('tipo')} placeholder="Ex: Cível, Trabalhista..." />
                {errors.tipo && (
                  <p className="text-xs text-destructive">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  tooltip="Selecione o cliente que é parte deste processo. Campo obrigatório"
                >
                  Cliente vinculado *
                </LabelWithTooltip>
                <Select onValueChange={(v) => setValue('cliente_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cliente_id && (
                  <p className="text-xs text-destructive">{errors.cliente_id.message}</p>
                )}
                {clienteSelecionado && (
                  <p className="text-xs text-muted-foreground">Selecionado: {clienteSelecionado.nome_completo}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="data_abertura"
                  tooltip="Data em que o processo foi aberto/iniciado no tribunal"
                >
                  Data de Abertura *
                </LabelWithTooltip>
                <Input id="data_abertura" type="date" {...register('data_abertura')} />
                {errors.data_abertura && (
                  <p className="text-xs text-destructive">{errors.data_abertura.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="vara_comarca"
                  tooltip="Vara e comarca onde o processo tramita (ex: 1ª Vara Cível - Salvador/BA)"
                >
                  Vara/Comarca *
                </LabelWithTooltip>
                <Input id="vara_comarca" {...register('vara_comarca')} placeholder="Ex: 1ª Vara Cível - Salvador/BA" />
                {errors.vara_comarca && (
                  <p className="text-xs text-destructive">{errors.vara_comarca.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="status"
                  tooltip="Situação atual do processo. Aberto: recém-iniciado; Em Andamento: em trâmite; Suspenso: pausado temporariamente; Encerrado: concluído; Arquivado: arquivado definitivamente"
                >
                  Status Inicial *
                </LabelWithTooltip>
                <Select onValueChange={(v) => setValue('status', v as ProcessoFormData['status'])} defaultValue="Aberto">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Suspenso">Suspenso</SelectItem>
                    <SelectItem value="Encerrado">Encerrado</SelectItem>
                    <SelectItem value="Arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  tooltip="Advogado responsável pela condução do processo. Campo opcional"
                >
                  Advogado responsável
                </LabelWithTooltip>
                <Select onValueChange={(v) => setValue('advogado_resp_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um advogado" />
                  </SelectTrigger>
                  <SelectContent>
                    {advogados.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.nome_completo} - {a.numero_oab}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {advogadoSelecionado && (
                  <p className="text-xs text-muted-foreground">Selecionado: {advogadoSelecionado.nome_completo}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="valor_causa"
                  tooltip="Valor monetário envolvido na causa. Campo opcional"
                >
                  Valor da Causa
                </LabelWithTooltip>
                <Input id="valor_causa" type="number" step="0.01" min="0" {...register('valor_causa', { valueAsNumber: true })} />
                {errors.valor_causa && (
                  <p className="text-xs text-destructive">{errors.valor_causa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="observacoes"
                  tooltip="Informações adicionais sobre o processo que possam ser úteis"
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

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/processos')}>
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

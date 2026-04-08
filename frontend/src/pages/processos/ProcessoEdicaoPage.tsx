import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { processoSchema, type ProcessoFormData } from '@/schemas'
import {
  getProcessoById,
  updateProcesso,
  deactivateProcesso,
  getProcessoErrorMessage,
} from '@/services/processo.service'
import { getClientes } from '@/services/cliente.service'
import { getAdvogados } from '@/services/advogado.service'
import type { Cliente, Advogado } from '@/types'

export function ProcessoEdicaoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [advogados, setAdvogados] = useState<Advogado[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProcessoFormData>({
    resolver: zodResolver(processoSchema),
  })

  const watchClienteId = watch('cliente_id')
  const watchAdvogadoId = watch('advogado_resp_id')

  useEffect(() => {
    getClientes({ page: 1, per_page: 100 }).then(r => setClientes(r.data)).catch(() => {})
    getAdvogados({ page: 1, per_page: 100 }).then(r => setAdvogados(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    const fetchProcesso = async () => {
      try {
        const processo = await getProcessoById(id)
        reset({
          numero_processo: processo.numero_processo,
          tipo: processo.tipo,
          cliente_id: processo.cliente_id,
          data_abertura: processo.data_abertura,
          vara_comarca: processo.vara_comarca,
          status: processo.status as ProcessoFormData['status'],
          advogado_resp_id: processo.advogado_resp_id || '',
          valor_causa: processo.valor_causa || 0,
          observacoes: processo.observacoes || '',
        })
      } catch (err) {
        setError(getProcessoErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchProcesso()
  }, [id, reset])

  const onSubmit = async (data: ProcessoFormData) => {
    if (!id) return
    try {
      await updateProcesso(id, {
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

  const handleDeactivate = async () => {
    if (!id) return
    try {
      await deactivateProcesso(id)
      navigate('/processos')
    } catch (err) {
      setError(getProcessoErrorMessage(err))
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

  const clienteSelecionado = clientes.find(c => c.id === watchClienteId)
  const advogadoSelecionado = advogados.find(a => a.id === watchAdvogadoId)

  return (
    <div className="px-6 py-4">
      <Header />
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="numero_processo">Número do Processo *</Label>
                <Input id="numero_processo" {...register('numero_processo')} />
                {errors.numero_processo && (
                  <p className="text-xs text-destructive">{errors.numero_processo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo do Processo *</Label>
                <Input id="tipo" {...register('tipo')} />
                {errors.tipo && (
                  <p className="text-xs text-destructive">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cliente vinculado *</Label>
                <Select onValueChange={(v) => setValue('cliente_id', v)} value={watchClienteId}>
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
                <Label htmlFor="data_abertura">Data de Abertura *</Label>
                <Input id="data_abertura" type="date" {...register('data_abertura')} />
                {errors.data_abertura && (
                  <p className="text-xs text-destructive">{errors.data_abertura.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vara_comarca">Vara/Comarca *</Label>
                <Input id="vara_comarca" {...register('vara_comarca')} />
                {errors.vara_comarca && (
                  <p className="text-xs text-destructive">{errors.vara_comarca.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={(v) => setValue('status', v as ProcessoFormData['status'])} value={watch('status')}>
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
                <Label>Advogado responsável</Label>
                <Select onValueChange={(v) => setValue('advogado_resp_id', v)} value={watchAdvogadoId}>
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
                <Label htmlFor="valor_causa">Valor da Causa</Label>
                <Input id="valor_causa" type="number" step="0.01" min="0" {...register('valor_causa', { valueAsNumber: true })} />
                {errors.valor_causa && (
                  <p className="text-xs text-destructive">{errors.valor_causa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input id="observacoes" {...register('observacoes')} />
                {errors.observacoes && (
                  <p className="text-xs text-destructive">{errors.observacoes.message}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button type="button" variant="destructive" onClick={() => setShowDeactivateDialog(true)}>
                  Encerrar/Arquivar
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => navigate('/processos')}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar encerramento/arquivamento</DialogTitle>
            <DialogDescription>
              Deseja realmente encerrar/arquivar este processo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeactivateDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Encerrar/Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

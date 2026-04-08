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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { clienteSchema, type ClienteFormData } from '@/schemas'
import {
  getClienteById,
  updateCliente,
  deactivateCliente,
  getErrorMessage,
} from '@/services/cliente.service'

export function ClienteEdicaoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  })

  useEffect(() => {
    if (!id) return
    const fetchCliente = async () => {
      try {
        const cliente = await getClienteById(id)
        reset({
          nome_completo: cliente.nome_completo,
          cpf_cnpj: cliente.cpf_cnpj,
          telefone: cliente.telefone,
          email: cliente.email || '',
          endereco: cliente.endereco,
          observacoes: cliente.observacoes || '',
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchCliente()
  }, [id, reset])

  const onSubmit = async (data: ClienteFormData) => {
    if (!id) return
    try {
      await updateCliente(id, {
        ...data,
        observacoes: data.observacoes || undefined,
        email: data.email || undefined,
      })
      navigate('/clientes')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDeactivate = async () => {
    if (!id) return
    try {
      await deactivateCliente(id)
      navigate('/clientes')
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
            <CardTitle>Editar Cliente</CardTitle>
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

              <div className="flex items-center justify-between pt-4">
                <Button type="button" variant="destructive" onClick={() => setShowDeactivateDialog(true)}>
                  Desativar
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => navigate('/clientes')}>
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
            <DialogTitle>Confirmar desativação</DialogTitle>
            <DialogDescription>
              Deseja realmente desativar este cliente? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeactivateDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

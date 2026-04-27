import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { ClientesPage } from '@/pages/clientes/ClientesPage'
import { ClienteCriacaoPage } from '@/pages/clientes/ClienteCriacaoPage'
import { ClienteEdicaoPage } from '@/pages/clientes/ClienteEdicaoPage'
import { AdvogadosPage } from '@/pages/advogados/AdvogadosPage'
import { AdvogadoCriacaoPage } from '@/pages/advogados/AdvogadoCriacaoPage'
import { AdvogadoEdicaoPage } from '@/pages/advogados/AdvogadoEdicaoPage'
import { DevedoresPage } from '@/pages/devedores/DevedoresPage'
import { DevedorCriacaoPage } from '@/pages/devedores/DevedorCriacaoPage'
import { DevedorEdicaoPage } from '@/pages/devedores/DevedorEdicaoPage'
import { ProcessosPage } from '@/pages/processos/ProcessosPage'
import { ProcessoCriacaoPage } from '@/pages/processos/ProcessoCriacaoPage'
import { ProcessoEdicaoPage } from '@/pages/processos/ProcessoEdicaoPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/novo" element={<ClienteCriacaoPage />} />
        <Route path="/clientes/:id" element={<ClienteEdicaoPage />} />
        <Route path="/advogados" element={<AdvogadosPage />} />
        <Route path="/advogados/novo" element={<AdvogadoCriacaoPage />} />
        <Route path="/advogados/:id" element={<AdvogadoEdicaoPage />} />
        <Route path="/devedores" element={<DevedoresPage />} />
        <Route path="/devedores/novo" element={<DevedorCriacaoPage />} />
        <Route path="/devedores/:id" element={<DevedorEdicaoPage />} />
        <Route path="/processos" element={<ProcessosPage />} />
        <Route path="/processos/novo" element={<ProcessoCriacaoPage />} />
        <Route path="/processos/:id" element={<ProcessoEdicaoPage />} />
      </Route>
    </Routes>
  )
}

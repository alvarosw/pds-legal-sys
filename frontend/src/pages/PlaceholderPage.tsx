import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="px-6 py-4">
      <Header />
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Este módulo será implementado nas próximas tarefas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

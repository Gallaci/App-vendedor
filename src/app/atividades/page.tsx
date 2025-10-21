
'use client';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default function AtividadesPage() {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Atividades</h1>
          <Button className="ml-auto" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Atividade
          </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atividades</CardTitle>
          <CardDescription>
            Gerencie suas tarefas e atividades.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Em breve, a lista de atividades será exibida aqui.</p>
        </CardContent>
      </Card>
    </div>
  )
}

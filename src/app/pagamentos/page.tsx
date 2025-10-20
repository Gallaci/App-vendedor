import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreditCard } from "lucide-react"

export default function PagamentosPage() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center h-full -mt-14">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">Pagamentos</CardTitle>
          <CardDescription>
            Funcionalidade em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Em breve, você poderá integrar com os principais métodos de pagamento para facilitar suas transações e automatizar o processo de venda.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import {
  gerarRelatorioDeVendasComInsights,
  type GerarRelatorioDeVendasComInsightsInput,
  type GerarRelatorioDeVendasComInsightsOutput,
} from "@/ai/flows/gerar-relatorios-de-vendas-com-insights"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Lightbulb } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] =
    useState<GerarRelatorioDeVendasComInsightsOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateReport = async (
    tipoRelatorio: GerarRelatorioDeVendasComInsightsInput["tipoRelatorio"]
  ) => {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await gerarRelatorioDeVendasComInsights({ tipoRelatorio })
      setReport(result)
    } catch (e) {
      console.error(e)
      setError("Ocorreu um erro ao gerar o relatório. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Geração de Relatórios com IA</CardTitle>
          <CardDescription>
            Selecione o período para gerar um relatório de vendas e obter
            insights automáticos com o poder da inteligência artificial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleGenerateReport("diario")}
              disabled={loading}
            >
              Relatório Diário
            </Button>
            <Button
              onClick={() => handleGenerateReport("semanal")}
              disabled={loading}
            >
              Relatório Semanal
            </Button>
            <Button
              onClick={() => handleGenerateReport("mensal")}
              disabled={loading}
            >
              Relatório Mensal
            </Button>
          </div>
        </CardContent>
        {loading && (
          <CardFooter>
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Gerando relatório, por favor aguarde...</span>
            </div>
          </CardFooter>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{report.relatorio}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Insights da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{report.insights}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

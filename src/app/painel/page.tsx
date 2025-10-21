'use client'
import { useMemo, useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ArrowUp, Users, ShoppingCart, DollarSign, Loader, FileText } from 'lucide-react'
import { useCollection } from '@/firebase/firestore/use-collection'
import { useFirestore } from '@/firebase'
import { collection } from 'firebase/firestore'
import type { Proposta, Cliente } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUser } from '@/firebase/auth/use-user'

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'hsl(var(--chart-1))',
  },
}

export default function PainelPage() {
  const firestore = useFirestore()
  const { user, loading: userLoading } = useUser();

  const propostasQuery = useMemo(() => {
    if (!firestore || !user) return null
    return collection(firestore, 'propostas')
  }, [firestore, user])

  const clientesQuery = useMemo(() => {
    if (!firestore || !user) return null
    return collection(firestore, 'clients');
  }, [firestore, user]);

  const { data: propostas, loading: loadingPropostas } = useCollection<Proposta>(propostasQuery)
  const { data: clientes, loading: loadingClientes } = useCollection<Cliente>(clientesQuery)
  
  const loading = userLoading || loadingPropostas || loadingClientes;

  const [totalReceita, setTotalReceita] = useState(0)
  const [totalPropostas, setTotalPropostas] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)
  const [ticketMedio, setTicketMedio] = useState(0)
  const [chartData, setChartData] = useState<{ month: string; sales: number }[]>([])
  const [totalVendas, setTotalVendas] = useState(0);

  useEffect(() => {
    if (propostas && propostas.length > 0) {
      const vendasConvertidas = propostas.filter(p => p.status === 'Convertida em Venda');
      const receita = vendasConvertidas.reduce((acc, proposta) => acc + (proposta.total || 0), 0)
      const numVendas = vendasConvertidas.length

      setTotalReceita(receita)
      setTotalPropostas(propostas.length)
      setTotalVendas(numVendas);
      setTicketMedio(numVendas > 0 ? receita / numVendas : 0)

      const salesByMonth = vendasConvertidas.reduce((acc, proposta) => {
        if (proposta.data) {
          const month = format(proposta.data.toDate(), 'MMM', { locale: ptBR });
          acc[month] = (acc[month] || 0) + (proposta.total || 0);
        }
        return acc;
      }, {} as Record<string, number>);

      const formattedChartData = Object.keys(salesByMonth).map(month => ({
        month,
        sales: salesByMonth[month],
      }));
      
      const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
      formattedChartData.sort((a, b) => monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase()));

      setChartData(formattedChartData);

    } else {
        setTotalReceita(0);
        setTotalPropostas(0);
        setTotalVendas(0);
        setTicketMedio(0);
        setChartData([]);
    }
  }, [propostas])

  useEffect(() => {
    if (clientes) {
      setTotalClientes(clientes.length)
    }
  }, [clientes])


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full -mt-14">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita (Vendas)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalReceita.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Calculado a partir de propostas convertidas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Convertidas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalVendas}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Total de propostas convertidas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalClientes}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
             Total de clientes cadastrados
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{totalPropostas}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                Total de propostas registradas
                </p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Vendas</CardTitle>
          <CardDescription>Um resumo das vendas (propostas convertidas) agrupadas por mês.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

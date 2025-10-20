'use client';

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, Loader } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemo } from "react";
import type { Venda } from "@/lib/types";
import { useUser } from "@/firebase/auth/use-user";

const statusVariant = {
  'Concluído': 'default',
  'Pendente': 'secondary',
  'Cancelado': 'destructive',
} as const;

export default function VendasPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const vendasQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'vendas');
  }, [firestore, user]);

  const { data: vendas, loading } = useCollection<Venda>(vendasQuery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Vendas</h1>
        <Button className="ml-auto" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Registrar Venda
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas vendas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Produto</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>
                      <div className="font-medium">{venda.cliente}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{venda.produto}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {venda.data ? format(venda.data.toDate(), "dd/MM/yyyy", { locale: ptBR }) : 'Data indisponível'}
                    </TableCell>
                    <TableCell className="text-right">R$ {venda.total.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={statusVariant[venda.status] || 'default'}>
                        {venda.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Gerar Fatura</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

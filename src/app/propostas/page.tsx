'use client';

import { useState, useMemo } from "react";
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
import type { Proposta, ItemProposta } from "@/lib/types";
import { useUser } from "@/firebase/auth/use-user";
import { AddPropostaDialog } from "@/components/propostas/add-proposta-dialog";
import { updatePropostaStatus } from "@/firebase/firestore/propostas";
import { useToast } from "@/hooks/use-toast";

const statusVariant = {
  'Aprovada': 'default',
  'Pendente': 'secondary',
  'Rejeitada': 'destructive',
  'Convertida em Venda': 'default', // Using default style which is green-ish
} as const;

export default function PropostasPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const propostasQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'propostas');
  }, [firestore, user]);

  const { data: propostas, loading: dataLoading } = useCollection<Proposta>(propostasQuery);
  const loading = userLoading || dataLoading;
  
  const handleConvertVenda = async (propostaId: string) => {
    try {
      await updatePropostaStatus(firestore, propostaId, 'Convertida em Venda');
      toast({
        title: 'Sucesso!',
        description: 'Proposta convertida em venda.',
      });
    } catch (error) {
      console.error("Error converting proposal: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Não foi possível converter a proposta. Tente novamente.',
      });
    }
  };

  const getProdutoServico = (item: ItemProposta) => {
    if (!item) return 'N/A';
    return `${item.tipo}: ${item.nome}`;
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Propostas</h1>
        <AddPropostaDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Button className="ml-auto" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Proposta
          </Button>
        </AddPropostaDialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Propostas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas propostas comerciais.
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
                  <TableHead className="text-center">Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Produto/Serviço</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Data</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
                  <TableHead className="text-center">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propostas.map((proposta) => (
                  <TableRow key={proposta.id}>
                    <TableCell className="text-center">
                      <div className="font-medium">{proposta.cliente}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">{getProdutoServico(proposta.itens[0])}</TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      {proposta.data ? format(proposta.data.toDate(), "dd/MM/yyyy", { locale: ptBR }) : 'Data indisponível'}
                    </TableCell>
                    <TableCell className="text-center">R$ {proposta.total.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                       <Badge 
                        variant={statusVariant[proposta.status] || 'default'}
                        className={`inline-block ${proposta.status === 'Convertida em Venda' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        {proposta.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
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
                          <DropdownMenuItem
                            onClick={() => handleConvertVenda(proposta.id)}
                            disabled={proposta.status === 'Convertida em Venda'}
                          >
                            Converter em Venda
                          </DropdownMenuItem>
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

'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { MoreHorizontal, PlusCircle, Phone, MessageSquare, Loader } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemo } from "react";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Cliente } from "@/lib/types";
import { useUser } from "@/firebase/auth/use-user";

export default function ClientesPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const clientesQuery = useMemo(() => {
    // Only create the query if the user is loaded and authenticated
    if (!firestore || !user) return null;
    return collection(firestore, 'clientes');
  }, [firestore, user]);

  const { data: clientes, loading: dataLoading } = useCollection<Cliente>(clientesQuery);
  const loading = userLoading || dataLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Clientes</h1>
        <Button className="ml-auto" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja o histórico de compras.
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
                <TableHead className="hidden sm:table-cell">Contato</TableHead>
                <TableHead className="hidden md:table-cell">Cidade</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={cliente.avatarUrl} alt="Avatar" />
                        <AvatarFallback>{cliente.nome.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-xs text-muted-foreground hidden md:block">{cliente.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`tel:${cliente.telefone}`}>
                                <Phone className="h-4 w-4" />
                                <span className="sr-only">Ligar</span>
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`https://wa.me/${cliente.telefone}`}>
                                <MessageSquare className="h-4 w-4" />
                                <span className="sr-only">Mensagem</span>
                            </Link>
                        </Button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{cliente.cidade}</TableCell>
                  <TableCell className="text-right">R$ {cliente.totalGasto.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
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

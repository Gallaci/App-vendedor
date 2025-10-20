'use client';
import Image from "next/image"
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
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemo } from "react";
import type { Produto } from "@/lib/types";
import { useUser } from "@/firebase/auth/use-user";

export default function ProdutosPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const produtosQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'produtos');
  }, [firestore, user]);

  const { data: produtos, loading } = useCollection<Produto>(produtosQuery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Produtos</h1>
        <Button className="ml-auto" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Gerencie seus produtos e visualize o inventário.
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
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Imagem</span>
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Estoque
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Imagem do produto"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={produto.imageUrl || 'https://placehold.co/64x64'}
                        width="64"
                        data-ai-hint={produto.imageHint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>
                      <Badge variant={produto.estoque > 0 ? "outline" : "secondary"}>
                        {produto.estoque > 0 ? "Em estoque" : "Fora de estoque"}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {produto.estoque}
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

'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useCollection } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addProposta } from '@/firebase/firestore/propostas';
import type { Cliente } from '@/lib/types';

const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Selecione um cliente.' }),
  produto: z.string().min(2, { message: 'O nome do produto/serviço deve ter pelo menos 2 caracteres.' }),
  quantidade: z.coerce.number().min(1, { message: 'A quantidade deve ser pelo menos 1.' }),
  total: z.coerce.number().min(0.01, { message: 'O total deve ser positivo.' }),
});

type AddPropostaFormValues = z.infer<typeof formSchema>;

interface AddPropostaDialogProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddPropostaDialog({ children, open, onOpenChange }: AddPropostaDialogProps) {
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const clientesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);
  const { data: clientes, loading: loadingClientes } = useCollection<Cliente>(clientesQuery);
  
  const form = useForm<AddPropostaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      produto: '',
      quantidade: 1,
      total: 0,
    },
  });

  const onSubmit = async (values: AddPropostaFormValues) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Erro!',
            description: 'Você precisa estar logado para criar uma proposta.',
        });
        return;
    }

    setLoading(true);
    try {
        const newPropostaData = {
            ...values,
            status: 'Pendente' as const,
            data: serverTimestamp(),
        };
      await addProposta(firestore, newPropostaData);

      toast({
        title: 'Sucesso!',
        description: 'Nova proposta criada.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding proposal: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Não foi possível criar a proposta. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Proposta</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registrar uma nova proposta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingClientes ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        clientes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="produto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto/Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Consultoria de Vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1500.00" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading || loadingClientes}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Proposta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

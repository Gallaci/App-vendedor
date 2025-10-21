'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useCollection } from '@/firebase';
import { serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addProposta } from '@/firebase/firestore/propostas';
import type { Cliente, ItemProposta, Proposta } from '@/lib/types';
import { collection } from "firebase/firestore";

const itemBaseSchema = z.object({
  quantidade: z.coerce.number().min(1, 'A quantidade deve ser pelo menos 1.'),
});

const projetoSchema = itemBaseSchema.extend({
  tipo: z.literal('Projeto'),
  nome: z.enum(['Projeto 1', 'Projeto 2', 'Projeto 3'], { required_error: 'Selecione um projeto.' }),
  valor: z.coerce.number().positive('O valor deve ser positivo.'),
});

const licencaSchema = itemBaseSchema.extend({
  tipo: z.literal('Licenca'),
  nome: z.enum(['Licença 1', 'Licença 2', 'Licença 3'], { required_error: 'Selecione uma licença.' }),
  valorCliente: z.coerce.number().positive('O valor para o cliente deve ser positivo.'),
  margemRecorrente: z.coerce.number().min(0, 'A margem não pode ser negativa.'),
  margemAvulso: z.coerce.number().min(0, 'A margem não pode ser negativa.'),
});

const contratoSchema = itemBaseSchema.extend({
    tipo: z.literal('Contrato'),
    nome: z.enum(['Contrato 1', 'Contrato 2', 'Contrato 3'], { required_error: 'Selecione um contrato.' }),
    valor: z.coerce.number().positive('O valor deve ser positivo.'),
});

const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Selecione um cliente.' }),
  itemTipo: z.enum(['Projeto', 'Licenca', 'Contrato'], { required_error: 'Selecione o tipo de item.' }),
  
  // Campos do item - serão validados dinamicamente
  nome: z.string().optional(),
  quantidade: z.coerce.number().min(1).optional(),
  valor: z.coerce.number().optional(),
  valorCliente: z.coerce.number().optional(),
  margemRecorrente: z.coerce.number().optional(),
  margemAvulso: z.coerce.number().optional(),

}).superRefine((data, ctx) => {
    switch (data.itemTipo) {
        case 'Projeto':
            if (!data.nome || !['Projeto 1', 'Projeto 2', 'Projeto 3'].includes(data.nome)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um projeto válido.', path: ['nome'] });
            }
            if (!data.valor || data.valor <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O valor deve ser positivo.', path: ['valor'] });
            }
            break;
        case 'Licenca':
            if (!data.nome || !['Licença 1', 'Licença 2', 'Licença 3'].includes(data.nome)) {
                 ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione uma licença válida.', path: ['nome'] });
            }
            if (!data.valorCliente || data.valorCliente <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O valor para o cliente deve ser positivo.', path: ['valorCliente'] });
            }
            if (data.margemRecorrente === undefined || data.margemRecorrente < 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A margem não pode ser negativa.', path: ['margemRecorrente'] });
            }
            if (data.margemAvulso === undefined || data.margemAvulso < 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A margem não pode ser negativa.', path: ['margemAvulso'] });
            }
            break;
        case 'Contrato':
             if (!data.nome || !['Contrato 1', 'Contrato 2', 'Contrato 3'].includes(data.nome)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um contrato válido.', path: ['nome'] });
            }
            if (!data.valor || data.valor <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O valor deve ser positivo.', path: ['valor'] });
            }
            break;
    }
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
      quantidade: 1,
    },
  });

  const itemTipo = useWatch({ control: form.control, name: 'itemTipo' });

  const onSubmit = async (values: AddPropostaFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro!', description: 'Você precisa estar logado para criar uma proposta.'});
        return;
    }

    setLoading(true);
    try {
        let item: ItemProposta;
        let total = 0;
        const quantidade = values.quantidade || 1;

        switch (values.itemTipo) {
            case 'Projeto':
                total = (values.valor || 0) * quantidade;
                item = {
                    tipo: 'Projeto',
                    nome: values.nome as any,
                    quantidade,
                    valor: values.valor!,
                };
                break;
            case 'Licenca':
                total = (values.valorCliente || 0) * quantidade;
                item = {
                    tipo: 'Licenca',
                    nome: values.nome as any,
                    quantidade,
                    valorCliente: values.valorCliente!,
                    margemRecorrente: values.margemRecorrente!,
                    margemAvulso: values.margemAvulso!,
                };
                break;
            case 'Contrato':
                total = (values.valor || 0) * quantidade;
                item = {
                    tipo: 'Contrato',
                    nome: values.nome as any,
                    quantidade,
                    valor: values.valor!,
                };
                break;
            default:
                throw new Error("Tipo de item inválido");
        }

      const newPropostaData = {
          cliente: values.cliente,
          itens: [item], // Armazenando como uma lista de itens
          total: total,
          status: 'Pendente' as const,
          data: serverTimestamp(),
      };

      await addProposta(firestore, newPropostaData as Omit<Proposta, 'id'>);

      toast({ title: 'Sucesso!', description: 'Nova proposta criada.' });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding proposal: ", error);
      toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível criar a proposta. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset({ cliente: '', quantidade: 1 });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Nova Proposta</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registrar uma nova proposta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField control={form.control} name="cliente" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl>
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
            )}/>
            <FormField control={form.control} name="itemTipo" render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Item</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo de item" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Projeto">Projeto</SelectItem>
                            <SelectItem value="Licenca">Licença</SelectItem>
                            <SelectItem value="Contrato">Contrato</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>

            {itemTipo === 'Projeto' && (
              <>
                <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Projeto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Projeto 1">Projeto 1</SelectItem>
                                <SelectItem value="Projeto 2">Projeto 2</SelectItem>
                                <SelectItem value="Projeto 3">Projeto 3</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="quantidade" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="valor" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor do Projeto (R$)</FormLabel>
                            <FormControl><Input type="number" placeholder="1500.00" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
              </>
            )}

            {itemTipo === 'Licenca' && (
                <>
                    <FormField control={form.control} name="nome" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome da Licença</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a licença" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Licença 1">Licença 1</SelectItem>
                                    <SelectItem value="Licença 2">Licença 2</SelectItem>
                                    <SelectItem value="Licença 3">Licença 3</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="quantidade" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="valorCliente" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor p/ Cliente (R$)</FormLabel>
                                <FormControl><Input type="number" placeholder="250.00" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="margemRecorrente" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Margem Recorrente (R$)</FormLabel>
                                <FormControl><Input type="number" placeholder="50.00" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="margemAvulso" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Margem Avulsa (R$)</FormLabel>
                                <FormControl><Input type="number" placeholder="100.00" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </>
            )}

             {itemTipo === 'Contrato' && (
              <>
                <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Contrato</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Contrato 1">Contrato 1</SelectItem>
                                <SelectItem value="Contrato 2">Contrato 2</SelectItem>
                                <SelectItem value="Contrato 3">Contrato 3</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="quantidade" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="valor" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor do Contrato (R$)</FormLabel>
                            <FormControl><Input type="number" placeholder="500.00" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button type="submit" disabled={loading || loadingClientes || !itemTipo}>
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

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useCollection } from '@/firebase';
import { serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addProposta } from '@/firebase/firestore/propostas';
import type { Cliente } from '@/lib/types';
import { collection } from "firebase/firestore";

const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Selecione um cliente.' }),
  tipo: z.enum(['Projeto', 'Licenca'], { required_error: 'Selecione o tipo de proposta.' }),

  // Campos de Projeto
  nomeProjeto: z.enum(['Projeto 1', 'Projeto 2', 'Projeto 3']).optional(),
  valorProjeto: z.coerce.number().optional(),

  // Campos de Licença
  nomeLicenca: z.enum(['Licença 1', 'Licença 2', 'Licença 3']).optional(),
  valorCliente: z.coerce.number().optional(),
  margemRecorrente: z.coerce.number().optional(),
  margemAvulso: z.coerce.number().optional(),
  
  quantidade: z.coerce.number().min(1, { message: 'A quantidade deve ser pelo menos 1.' }),
}).superRefine((data, ctx) => {
    if (data.tipo === 'Projeto') {
        if (!data.nomeProjeto) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um projeto.', path: ['nomeProjeto'] });
        }
        if (data.valorProjeto === undefined || data.valorProjeto <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O valor deve ser positivo.', path: ['valorProjeto'] });
        }
    }
    if (data.tipo === 'Licenca') {
        if (!data.nomeLicenca) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione uma licença.', path: ['nomeLicenca'] });
        }
        if (data.valorCliente === undefined || data.valorCliente <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O valor deve ser positivo.', path: ['valorCliente'] });
        }
        if (data.margemRecorrente === undefined || data.margemRecorrente < 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A margem não pode ser negativa.', path: ['margemRecorrente'] });
        }
         if (data.margemAvulso === undefined || data.margemAvulso < 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A margem não pode ser negativa.', path: ['margemAvulso'] });
        }
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

  const tipoProposta = useWatch({ control: form.control, name: 'tipo' });

  const onSubmit = async (values: AddPropostaFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro!', description: 'Você precisa estar logado para criar uma proposta.'});
        return;
    }

    setLoading(true);
    try {
        let newPropostaData: any;
        let total = 0;

        if (values.tipo === 'Projeto') {
            total = (values.valorProjeto || 0) * values.quantidade;
            newPropostaData = {
                cliente: values.cliente,
                tipo: 'Projeto',
                nomeProjeto: values.nomeProjeto,
                quantidade: values.quantidade,
                valorProjeto: values.valorProjeto,
                total,
            };
        } else { // Licenca
            total = (values.valorCliente || 0) * values.quantidade;
            newPropostaData = {
                cliente: values.cliente,
                tipo: 'Licenca',
                nomeLicenca: values.nomeLicenca,
                quantidade: values.quantidade,
                valorCliente: values.valorCliente,
                margemRecorrente: values.margemRecorrente,
                margemAvulso: values.margemAvulso,
                total,
            };
        }

      await addProposta(firestore, {
        ...newPropostaData,
        status: 'Pendente' as const,
        data: serverTimestamp(),
      });

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

  // Reset form when dialog closes
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
              name="tipo"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Proposta</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Projeto" />
                        </FormControl>
                        <FormLabel className="font-normal">Projeto</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Licenca" />
                        </FormControl>
                        <FormLabel className="font-normal">Licença</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipoProposta === 'Projeto' && (
              <>
                <FormField control={form.control} name="nomeProjeto" render={({ field }) => (
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
                    <FormField control={form.control} name="valorProjeto" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor do Projeto (R$)</FormLabel>
                            <FormControl><Input type="number" placeholder="1500.00" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
              </>
            )}

            {tipoProposta === 'Licenca' && (
                <>
                    <FormField control={form.control} name="nomeLicenca" render={({ field }) => (
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

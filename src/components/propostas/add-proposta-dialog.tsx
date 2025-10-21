
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
import { useForm, useWatch, useFieldArray, Control } from 'react-hook-form';
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
import { Loader2, Trash2 } from 'lucide-react';
import { addProposta } from '@/firebase/firestore/propostas';
import type { Cliente, ItemProposta, Proposta } from '@/lib/types';
import { collection } from "firebase/firestore";
import { Separator } from '@/components/ui/separator';

const itemSchema = z.discriminatedUnion("tipo", [
    z.object({
        tipo: z.literal('Projeto'),
        nome: z.enum(['Projeto 1', 'Projeto 2', 'Projeto 3'], { required_error: 'Selecione um projeto.' }),
        quantidade: z.coerce.number().min(1, 'A quantidade deve ser pelo menos 1.'),
        valor: z.coerce.number().positive('O valor deve ser positivo.'),
    }),
    z.object({
        tipo: z.literal('Licenca'),
        nome: z.enum(['Licença 1', 'Licença 2', 'Licença 3'], { required_error: 'Selecione uma licença.' }),
        quantidade: z.coerce.number().min(1, 'A quantidade deve ser pelo menos 1.'),
        valorCliente: z.coerce.number().positive('O valor para o cliente deve ser positivo.'),
        margemRecorrente: z.coerce.number().min(0, 'A margem não pode ser negativa.'),
        margemAvulso: z.coerce.number().min(0, 'A margem não pode ser negativa.').optional(),
    }),
    z.object({
        tipo: z.literal('Contrato'),
        nome: z.enum(['Contrato 1', 'Contrato 2', 'Contrato 3'], { required_error: 'Selecione um contrato.' }),
        quantidade: z.coerce.number().min(1, 'A quantidade deve ser pelo menos 1.'),
        valor: z.coerce.number().positive('O valor deve ser positivo.'),
    }),
]);

const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Selecione um cliente.' }),
  itens: z.array(itemSchema).min(1, 'Adicione pelo menos um item à proposta.'),
});


type AddPropostaFormValues = z.infer<typeof formSchema>;

interface PropostaItemProps {
    control: Control<AddPropostaFormValues>;
    index: number;
    remove: (index: number) => void;
}

function PropostaItem({ control, index, remove }: PropostaItemProps) {
    const itemTipo = useWatch({
        control,
        name: `itens.${index}.tipo` as const,
    });

    return (
        <div className="p-4 border rounded-md relative mb-4 space-y-4">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => remove(index)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>

            <FormField
                control={control}
                name={`itens.${index}.tipo`}
                render={({ field: fieldType }) => (
                    <FormItem>
                        <FormLabel>Tipo de Item</FormLabel>
                        <Select onValueChange={fieldType.onChange} defaultValue={fieldType.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Projeto">Projeto</SelectItem>
                                <SelectItem value="Licenca">Licença</SelectItem>
                                <SelectItem value="Contrato">Contrato</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {itemTipo === 'Projeto' && (
                <>
                    <FormField control={control} name={`itens.${index}.nome`} render={({ field: fieldNome }) => (
                        <FormItem>
                            <FormLabel>Nome do Projeto</FormLabel>
                            <Select onValueChange={fieldNome.onChange} defaultValue={fieldNome.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
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
                        <FormField control={control} name={`itens.${index}.quantidade`} render={({ field: fieldQty }) => (
                            <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" placeholder="1" {...fieldQty} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={control} name={`itens.${index}.valor`} render={({ field: fieldVal }) => (
                            <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" placeholder="1500.00" step="0.01" {...fieldVal} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </>
            )}

            {itemTipo === 'Licenca' && (
                <>
                    <FormField control={control} name={`itens.${index}.nome`} render={({ field: fieldNome }) => (
                        <FormItem>
                            <FormLabel>Nome da Licença</FormLabel>
                            <Select onValueChange={fieldNome.onChange} defaultValue={fieldNome.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
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
                        <FormField control={control} name={`itens.${index}.quantidade`} render={({ field: fieldQty }) => (
                            <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" placeholder="1" {...fieldQty} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={control} name={`itens.${index}.valorCliente`} render={({ field: fieldVal }) => (
                            <FormItem><FormLabel>Valor p/ Cliente (R$)</FormLabel><FormControl><Input type="number" placeholder="250.00" step="0.01" {...fieldVal} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={control} name={`itens.${index}.margemRecorrente`} render={({ field: fieldMr }) => (
                            <FormItem><FormLabel>Margem Recorrente (R$)</FormLabel><FormControl><Input type="number" placeholder="50.00" step="0.01" {...fieldMr} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={control} name={`itens.${index}.margemAvulso`} render={({ field: fieldMa }) => (
                            <FormItem><FormLabel>Margem Avulsa (R$)</FormLabel><FormControl><Input type="number" placeholder="100.00" step="0.01" {...fieldMa} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </>
            )}

            {itemTipo === 'Contrato' && (
                <>
                    <FormField control={control} name={`itens.${index}.nome`} render={({ field: fieldNome }) => (
                        <FormItem>
                            <FormLabel>Nome do Contrato</FormLabel>
                            <Select onValueChange={fieldNome.onChange} defaultValue={fieldNome.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
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
                        <FormField control={control} name={`itens.${index}.quantidade`} render={({ field: fieldQty }) => (
                            <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" placeholder="1" {...fieldQty} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={control} name={`itens.${index}.valor`} render={({ field: fieldVal }) => (
                            <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" placeholder="500.00" step="0.01" {...fieldVal} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </>
            )}
        </div>
    );
}

interface AddPropostaDialogProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const defaultItemValues = {
    Projeto: { tipo: 'Projeto' as const, nome: 'Projeto 1' as const, quantidade: 1, valor: 0 },
    Licenca: { tipo: 'Licenca' as const, nome: 'Licença 1' as const, quantidade: 1, valorCliente: 0, margemRecorrente: 0, margemAvulso: '' },
    Contrato: { tipo: 'Contrato' as const, nome: 'Contrato 1' as const, quantidade: 1, valor: 0 },
};

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
      itens: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itens",
  });

  const watchedItens = useWatch({
    control: form.control,
    name: 'itens',
  });

  const totalProposta = useMemo(() => {
    if (!watchedItens) return 0;
    return watchedItens.reduce((sum, item) => {
        const quantidade = item.quantidade || 0;
        let itemTotal = 0;
        if (item.tipo === 'Projeto' || item.tipo === 'Contrato') {
            itemTotal = (item.valor || 0) * quantidade;
        } else if (item.tipo === 'Licenca') {
            itemTotal = (item.valorCliente || 0) * quantidade;
        }
        return sum + itemTotal;
    }, 0);
  }, [watchedItens]);


  const onSubmit = async (values: AddPropostaFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro!', description: 'Você precisa estar logado para criar uma proposta.'});
        return;
    }

    setLoading(true);
    try {
      const newPropostaData = {
          cliente: values.cliente,
          itens: values.itens.map(item => {
            if (item.tipo === 'Licenca') {
                return {
                    ...item,
                    margemAvulso: item.margemAvulso ? Number(item.margemAvulso) : undefined
                };
            }
            return item;
          }),
          total: totalProposta,
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
      form.reset({ cliente: '', itens: [] });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Proposta</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo e adicione os itens para registrar uma nova proposta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
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
                
                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-2">Itens da Proposta</h3>
                     {fields.map((field, index) => (
                        <PropostaItem
                          key={field.id}
                          control={form.control}
                          index={index}
                          remove={remove}
                        />
                     ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append(defaultItemValues.Projeto)}
                        className="mt-4"
                    >
                        Adicionar Item
                    </Button>
                     <FormMessage>{form.formState.errors.itens?.message}</FormMessage>
                </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center pt-2">
                <div className="text-lg font-semibold">
                    Total da Proposta:
                </div>
                <div className="text-lg font-bold text-primary">
                    R$ {totalProposta.toFixed(2)}
                </div>
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


    
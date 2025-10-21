
'use client';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { addAtividade } from "@/firebase/firestore/atividades";
import { serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

const ligacaoFormSchema = z.object({
  contato: z.string().min(2, "Nome do contato é obrigatório."),
  telefone: z.string().optional(),
  email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
  atendida: z.boolean().default(false),
  reuniaoAgendada: z.boolean().default(false),
  apresentacaoEnviada: z.boolean().default(false),
  anotacoes: z.string().optional(),
});

type LigacaoFormValues = z.infer<typeof ligacaoFormSchema>;

function TabLigacoes() {
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<LigacaoFormValues>({
    resolver: zodResolver(ligacaoFormSchema),
    defaultValues: {
      contato: "",
      telefone: "",
      email: "",
      atendida: false,
      reuniaoAgendada: false,
      apresentacaoEnviada: false,
      anotacoes: "",
    },
  });

  const onSubmit = async (values: LigacaoFormValues) => {
    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
      return;
    }
    setLoading(true);
    try {
      await addAtividade(firestore, {
        tipo: 'ligacao',
        titulo: `Ligação para ${values.contato}`,
        data: serverTimestamp(),
        status: 'Concluída',
        createdBy: user.email,
        detalhes: values,
      });
      toast({ title: 'Sucesso!', description: 'Registro de ligação salvo.' });
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a atividade.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Ligação</CardTitle>
        <CardDescription>
          Use este formulário para registrar uma chamada de prospecção ou acompanhamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa/Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="atendida"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ligação Atendida?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reuniaoAgendada"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Reunião Agendada (Lead Out)?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apresentacaoEnviada"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Apresentação Enviada?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="anotacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre a conversa, próximos passos, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Registro
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}


export default function AtividadesPage() {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Atividades</h1>
      </div>

      <Tabs defaultValue="ligacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ligacoes">Ligações</TabsTrigger>
          <TabsTrigger value="lead-inbound">Lead Inbound</TabsTrigger>
          <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="leads-out">Leads Out</TabsTrigger>
          <TabsTrigger value="formulario">Formulário</TabsTrigger>
        </TabsList>

        <TabsContent value="ligacoes" className="mt-4">
          <TabLigacoes />
        </TabsContent>

        <TabsContent value="lead-inbound" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Inbound</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Formulário para registrar leads inbound em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reunioes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reuniões</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Formulário para registrar reuniões em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Formulário para registrar avaliações em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads-out" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads Out</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lista de leads outbound (reuniões agendadas) em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-in Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de formulário de check-in semanal em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

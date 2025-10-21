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
import { useMemo, useState, useEffect } from "react";
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
import { collection, serverTimestamp, where, query } from "firebase/firestore";
import { Loader2, ExternalLink } from "lucide-react";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Atividade, DetalhesLigacao, Proposta } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { format, startOfWeek, endOfWeek, getWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Schemas
const ligacaoFormSchema = z.object({
  contato: z.string().min(2, "Nome do contato é obrigatório."),
  telefone: z.string().optional(),
  email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
  atendida: z.boolean().default(false),
  reuniaoAgendada: z.boolean().default(false),
  apresentacaoEnviada: z.boolean().default(false),
  anotacoes: z.string().optional(),
});

const leadInboundFormSchema = z.object({
    nome: z.string().min(2, "Nome é obrigatório."),
    contato: z.string().min(1, "Insira um telefone ou e-mail."),
    anotacoes: z.string().optional(),
})

const reuniaoFormSchema = z.object({
    cliente: z.string().min(2, "Nome do cliente é obrigatório."),
    anotacoes: z.string().min(10, "Forneça alguns detalhes da reunião."),
})

const avaliacaoFormSchema = z.object({
    cliente: z.string().min(2, "Nome do cliente é obrigatório."),
    feedback: z.string().min(10, "Escreva o feedback recebido."),
})


// Tipos dos formulários
type LigacaoFormValues = z.infer<typeof ligacaoFormSchema>;
type LeadInboundFormValues = z.infer<typeof leadInboundFormSchema>;
type ReuniaoFormValues = z.infer<typeof reuniaoFormSchema>;
type AvaliacaoFormValues = z.infer<typeof avaliacaoFormSchema>;


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
        status: values.atendida ? 'Concluída' : 'Pendente',
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
            <div className="flex flex-wrap items-center gap-4">
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

function TabLeadInbound() {
    const [loading, setLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
  
    const form = useForm<LeadInboundFormValues>({
      resolver: zodResolver(leadInboundFormSchema),
      defaultValues: { nome: "", contato: "", anotacoes: "" },
    });
  
    const onSubmit = async (values: LeadInboundFormValues) => {
      if (!user || !user.email) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
        return;
      }
      setLoading(true);
      try {
        await addAtividade(firestore, {
          tipo: 'lead-inbound',
          titulo: `Lead Inbound: ${values.nome}`,
          data: serverTimestamp(),
          status: 'Pendente',
          createdBy: user.email,
          detalhes: values,
        });
        toast({ title: 'Sucesso!', description: 'Lead Inbound registrado.' });
        form.reset();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o lead.' });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registrar Lead Inbound</CardTitle>
          <CardDescription>Registre um cliente que entrou em contato espontaneamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="nome" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl><Input placeholder="Ex: Maria Souza" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="contato" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone ou E-mail</FormLabel>
                    <FormControl><Input placeholder="(99) 99999-9999 ou maria@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="anotacoes" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anotações</FormLabel>
                    <FormControl><Textarea placeholder="Sobre o que o cliente falou?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Lead
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
}

function TabReunioes() {
    const [loading, setLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
  
    const form = useForm<ReuniaoFormValues>({
      resolver: zodResolver(reuniaoFormSchema),
      defaultValues: { cliente: "", anotacoes: "" },
    });
  
    const onSubmit = async (values: ReuniaoFormValues) => {
      if (!user || !user.email) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
        return;
      }
      setLoading(true);
      try {
        await addAtividade(firestore, {
          tipo: 'reuniao',
          titulo: `Reunião com ${values.cliente}`,
          data: serverTimestamp(),
          status: 'Concluída',
          createdBy: user.email,
          detalhes: values,
        });
        toast({ title: 'Sucesso!', description: 'Registro de reunião salvo.' });
        form.reset();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a reunião.' });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registrar Reunião</CardTitle>
          <CardDescription>Anote os detalhes de uma reunião realizada.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="cliente" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente/Empresa</FormLabel>
                    <FormControl><Input placeholder="Ex: Empresa XPTO" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="anotacoes" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anotações da Reunião</FormLabel>
                    <FormControl><Textarea placeholder="Pontos discutidos, próximos passos, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Reunião
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
}

function TabAvaliacoes() {
    const [loading, setLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
  
    const form = useForm<AvaliacaoFormValues>({
      resolver: zodResolver(avaliacaoFormSchema),
      defaultValues: { cliente: "", feedback: "" },
    });
  
    const onSubmit = async (values: AvaliacaoFormValues) => {
      if (!user || !user.email) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
        return;
      }
      setLoading(true);
      try {
        await addAtividade(firestore, {
          tipo: 'avaliacao',
          titulo: `Avaliação de ${values.cliente}`,
          data: serverTimestamp(),
          status: 'Concluída',
          createdBy: user.email,
          detalhes: values,
        });
        toast({ title: 'Sucesso!', description: 'Avaliação registrada.' });
        form.reset();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a avaliação.' });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registrar Avaliação</CardTitle>
          <CardDescription>Registre feedbacks ou avaliações recebidas de clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="cliente" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl><Input placeholder="Ex: Joana" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="feedback" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Recebido</FormLabel>
                    <FormControl><Textarea placeholder="Descreva o feedback recebido." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Avaliação
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
}

function TabLeadsOut() {
    const firestore = useFirestore();
    const { user, loading: userLoading } = useUser();
  
    const leadsOutQuery = useMemo(() => {
        if (!firestore || !user?.email) return null;
        return query(collection(firestore, 'atividades'), where("createdBy", "==", user.email));
    }, [firestore, user]);

    const { data: atividades, loading: dataLoading } = useCollection<Atividade>(leadsOutQuery);
    const loading = userLoading || dataLoading;
  
    const leadsOut = atividades.filter(
        (atividade) => atividade.tipo === 'ligacao' && atividade.detalhes.reuniaoAgendada
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads Outbound Gerados</CardTitle>
          <CardDescription>Contatos de ligações que resultaram em uma reunião agendada.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : leadsOut.length === 0 ? (
                <p>Nenhuma reunião agendada a partir de ligações ainda.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contato</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Data da Ligação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leadsOut.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">{(lead.detalhes as DetalhesLigacao).contato}</TableCell>
                                <TableCell>{(lead.detalhes as DetalhesLigacao).telefone || 'N/A'}</TableCell>
                                <TableCell>{(lead.detalhes as DetalhesLigacao).email || 'N/A'}</TableCell>
                                <TableCell>
                                {lead.data ? format(lead.data.toDate(), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    );
}

function TabFormulario() {
    const [isFriday, setIsFriday] = useState(false);
    const [formLink, setFormLink] = useState("");
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();
    const { user, loading: userLoading } = useUser();

    const atividadesQuery = useMemo(() => {
        if (!firestore || !user?.email) return null;
        return query(collection(firestore, 'atividades'), where("createdBy", "==", user.email));
    }, [firestore, user]);

    const propostasQuery = useMemo(() => {
        if (!firestore || !user?.email) return null;
        // As propostas não têm um campo createdBy, então pegamos todas por enquanto
        // Idealmente, propostas também deveriam ter 'createdBy'
        return collection(firestore, 'propostas');
    }, [firestore, user]);

    const { data: allActivities, loading: activitiesLoading } = useCollection<Atividade>(atividadesQuery);
    const { data: allProposals, loading: proposalsLoading } = useCollection<Proposta>(propostasQuery);

    useEffect(() => {
        const today = new Date();
        // Day 5 is Friday (0=Sunday, 1=Monday, ..., 6=Saturday)
        setIsFriday(today.getDay() === 5);

        if (userLoading || activitiesLoading || proposalsLoading) {
            setLoading(true);
            return;
        }

        setLoading(false);
        if (today.getDay() !== 5) return;

        // Date calculations
        const now = new Date();
        const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
        const startOfThisMonth = startOfMonth(now);
        const endOfThisMonth = endOfMonth(now);

        // Filter data for the current week/month
        const weeklyActivities = allActivities.filter(a => a.data && a.data.toDate() >= startOfThisWeek && a.data.toDate() <= endOfThisWeek);
        const weeklyProposals = allProposals.filter(p => p.data && p.data.toDate() >= startOfThisWeek && p.data.toDate() <= endOfThisWeek);
        const weeklySales = weeklyProposals.filter(p => p.status === 'Convertida em Venda');
        const monthlyProposals = allProposals.filter(p => p.data && p.data.toDate() >= startOfThisMonth && p.data.toDate() <= endOfThisMonth);

        // --- METRIC CALCULATIONS ---

        // Métrica 1: Período da Semana
        const weekNumber = getWeek(now, { weekStartsOn: 1 });
        const weekPeriod = `SEMANA ${weekNumber} - ${format(startOfThisWeek, 'dd/MM/yyyy')} – ${format(endOfThisWeek, 'dd/MM/yyyy')}`;

        // Métrica 2: Ligações Atendidas
        const answeredCalls = weeklyActivities.filter(a => a.tipo === 'ligacao' && a.detalhes.atendida).length;

        // Métrica 3: Apresentações Enviadas
        const presentationsSent = weeklyActivities.filter(a => a.tipo === 'ligacao' && a.detalhes.apresentacaoEnviada).length;

        // Métrica 4: Leads Inbound
        const inboundLeads = weeklyActivities.filter(a => a.tipo === 'lead-inbound').length;

        // Métrica 5: Leads Outbound
        const outboundLeads = weeklyActivities.filter(a => a.tipo === 'ligacao' && a.detalhes.reuniaoAgendada).length;

        // Métrica 6: Reuniões Realizadas
        const meetingsDone = weeklyActivities.filter(a => a.tipo === 'reuniao').length;

        // Métrica 7: Propostas Enviadas (Quantidade)
        const proposalsSent = weeklyProposals.length;

        // Métrica 8: Propostas Convertidas (Quantidade)
        const proposalsConverted = weeklyProposals.filter(p => p.status === 'Convertida em Venda').length;

        // Métrica 9: Propostas Enviadas (Valor)
        const proposalsSentValue = weeklyProposals.reduce((sum, p) => sum + p.total, 0).toFixed(2);

        // Métrica 10: Vendas Convertidas (Valor)
        const salesConvertedValue = weeklySales.reduce((sum, p) => sum + p.total, 0).toFixed(2);
        
        // Métrica 11: Maior Proposta da Semana
        const highestProposal = [...weeklyProposals].sort((a, b) => b.total - a.total)[0];
        const highestProposalText = highestProposal ? `${highestProposal.cliente} - R$ ${highestProposal.total.toFixed(2)}` : "Nenhuma";
        
        // Métrica 12: Propostas Ativas (Mês)
        const activeProposals = monthlyProposals.filter(p => p.status === 'Pendente').length; // Assuming 'sent' means 'Pendente'

        // Métrica 13: Propostas Perdidas
        const lostProposals = weeklyProposals
            .filter(p => p.status === 'Rejeitada')
            .map(p => `${p.cliente}: Motivo não informado`) // Assuming no reason field for now
            .join('; ');

        // --- URL GENERATION ---
        const baseUrl = "https://forms.microsoft.com/Pages/ResponsePage.aspx";
        const formId = "DQSI-e-k_USYrS43g02F-H4iWn_3X9BNjH4G4G4qg_VUN1pFRlBGTlJNT1ZWTllHQlJRRjZJTEFNUC4u";

        const params = {
            'r6164da4bf1774127be70555fea596f6e': weekPeriod,
            'r232934cc73534ca586c16c1195eb1d43': answeredCalls,
            'r952df77fc6f949b5957da64ef91e18da': presentationsSent,
            'rfb49832f1baf47fca56ece1d1cdba099': inboundLeads,
            'rdc528ecb651840b99ec9f6a494557683': outboundLeads,
            'r333ad29f43704b47ad514d79e2cad4be': meetingsDone,
            'r267073eb8cb44de4bf005a87f86c0f7c': proposalsSent,
            'r215b88aa6abe4ed6867c0c30577ee74b': proposalsConverted,
            'recce7d7dce744e21809d460f0e5c3e77': proposalsSentValue,
            'r7830854853bc4c7d86ef07caf67f0849': salesConvertedValue,
            'r7c7d987c4a2047fc8e3d46f64b33f6c2': highestProposalText,

            'r11a7fdb0e83d47a2b87211c12c656fad': activeProposals,
            'rfefedd6893aa4828835b70d5a5fcdb82': lostProposals || "Nenhuma proposta perdida esta semana.",
        };
        
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            const entry = { id: key, value: value };
            urlParams.append('originalparams', JSON.stringify(entry));
        });
        
        const finalUrl = `${baseUrl}?id=${formId}&params=${encodeURIComponent(urlParams.toString().replace(/originalparams=/g, ''))}`;
        setFormLink(finalUrl);

    }, [isFriday, allActivities, allProposals, user, userLoading, activitiesLoading, proposalsLoading]);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-in Semanal</CardTitle>
          <CardDescription>Resumo de atividades para o formulário semanal.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Calculando métricas da semana...</span>
             </div>
          ) : isFriday ? (
            <div className="space-y-4">
              <p>Hoje é dia de check-in! Use o link abaixo para preencher seu formulário com o resumo da semana.</p>
              <Button asChild>
                <a href={formLink} target="_blank" rel="noopener noreferrer">
                  Abrir Formulário de Check-in
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                O link abrirá em uma nova aba. O formulário estará pré-preenchido com as atividades da sua semana.
              </p>
            </div>
          ) : (
            <p>O formulário de check-in semanal fica disponível apenas às sextas-feiras. Volte em breve!</p>
          )}
        </CardContent>
      </Card>
    );
}


export default function AtividadesPage() {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Atividades</h1>
      </div>

      <Tabs defaultValue="ligacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
          <TabLeadInbound />
        </TabsContent>

        <TabsContent value="reunioes" className="mt-4">
          <TabReunioes />
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4">
          <TabAvaliacoes />
        </TabsContent>

        <TabsContent value="leads-out" className="mt-4">
          <TabLeadsOut />
        </TabsContent>

        <TabsContent value="formulario" className="mt-4">
          <TabFormulario />
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Proposta } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { format, getMonth, getYear, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper to generate month options
const generateMonthOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    options.push({
      value: `${getYear(date)}-${getMonth(date)}`,
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
    });
  }
  return options;
};


export default function VendasPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month);
    setStartDate(startOfMonth(date));
    setEndDate(endOfMonth(date));
  }, [selectedMonth]);
  

  const vendasQuery = useMemo(() => {
    if (!firestore || !user?.email || !startDate || !endDate) return null;
    return query(
      collection(firestore, 'propostas'),
      where('createdBy', '==', user.email),
      where('status', '==', 'Convertida em Venda'),
      where('data', '>=', Timestamp.fromDate(startDate)),
      where('data', '<=', Timestamp.fromDate(endDate))
    );
  }, [firestore, user, startDate, endDate]);

  const { data: vendas, loading: dataLoading } = useCollection<Proposta>(vendasQuery);
  const loading = userLoading || dataLoading;

  const totalVendasMes = useMemo(() => {
    return vendas.reduce((acc, venda) => acc + venda.total, 0);
  }, [vendas]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Relatório de Vendas</h1>
        <div className="w-[200px]">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                    {monthOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vendas de {monthOptions.find(m => m.value === selectedMonth)?.label}</CardTitle>
          <CardDescription>
            Total vendido no mês: <span className="font-bold text-primary">R$ {totalVendasMes.toFixed(2)}</span>
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
                  <TableHead className="hidden md:table-cell">Data da Venda</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.length === 0 && !loading ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">Nenhuma venda encontrada para este período.</TableCell>
                    </TableRow>
                ) : (
                    vendas.map((venda) => (
                        <TableRow key={venda.id}>
                        <TableCell>
                            <div className="font-medium">{venda.cliente}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            {venda.data ? format(venda.data.toDate(), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">R$ {venda.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

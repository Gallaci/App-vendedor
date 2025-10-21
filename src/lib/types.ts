'use client';
import { Timestamp } from 'firebase/firestore';

// Tipos de Itens da Proposta
export type ItemProjeto = {
  tipo: 'Projeto';
  nome: 'Projeto 1' | 'Projeto 2' | 'Projeto 3';
  quantidade: number;
  valor: number;
};

export type ItemLicenca = {
  tipo: 'Licenca';
  nome: 'Licença 1' | 'Licença 2' | 'Licença 3';
  quantidade: number;
  valorCliente: number;
  margemRecorrente: number;
  margemAvulso: number;
};

export type ItemContrato = {
    tipo: 'Contrato';
    nome: 'Contrato 1' | 'Contrato 2' | 'Contrato 3';
    quantidade: number;
    valor: number;
};

export type ItemProposta = ItemProjeto | ItemLicenca | ItemContrato;


// Tipo Proposta Principal
export type PropostaStatus = 'Pendente' | 'Aprovada' | 'Rejeitada' | 'Convertida em Venda';

export type Proposta = {
  id: string;
  cliente: string;
  data: Timestamp;
  status: PropostaStatus;
  itens: ItemProposta[];
  total: number;
};


export type Cliente = {
  id: string;
  name: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
  cidade?: string;
  totalGasto?: number;
  createdAt?: Timestamp;
  createdBy?: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'vendedor' | 'admin';
};

export type AtividadeStatus = 'Pendente' | 'Concluída';
export type AtividadeTipo = 'ligacao' | 'lead-inbound' | 'reuniao' | 'avaliacao';

export type DetalhesLigacao = {
  contato: string;
  telefone?: string;
  email?: string;
  atendida: boolean;
  reuniaoAgendada: boolean;
  apresentacaoEnviada: boolean;
  anotacoes?: string;
};

export type Atividade = {
    id: string;
    titulo: string;
    tipo: AtividadeTipo;
    data: Timestamp;
    status: AtividadeStatus;
    createdBy: string;
    detalhes: DetalhesLigacao | any; // 'any' para acomodar outros tipos de detalhes no futuro
};

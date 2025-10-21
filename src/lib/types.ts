import { Timestamp } from 'firebase/firestore';

export type PropostaStatus = 'Pendente' | 'Aprovada' | 'Rejeitada' | 'Convertida em Venda';

export type Proposta = {
  id: string;
  cliente: string;
  produto: string;
  quantidade: number;
  total: number;
  data: Timestamp;
  status: PropostaStatus;
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

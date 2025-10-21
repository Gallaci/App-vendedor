import { Timestamp } from 'firebase/firestore';

export type Venda = {
  id: string;
  cliente: string;
  produto: string;
  quantidade: number;
  total: number;
  data: Timestamp; 
  status: 'Concluído' | 'Pendente' | 'Cancelado';
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

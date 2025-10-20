import { Timestamp } from 'firebase/firestore';

export type Venda = {
  id: string;
  cliente: string;
  produto: string;
  quantidade: number;
  total: number;
  data: Timestamp; // Changed to Timestamp for Firestore
  status: 'Concluído' | 'Pendente' | 'Cancelado';
};

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  avatarUrl: string;
  cidade: string;
  totalGasto: number;
};

export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imageUrl: string;
  imageHint: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'vendedor' | 'admin';
};

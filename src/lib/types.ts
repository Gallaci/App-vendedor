export type Venda = {
  id: string;
  cliente: string;
  produto: string;
  quantidade: number;
  total: number;
  data: string;
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

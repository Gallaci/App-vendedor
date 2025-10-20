import type { Produto, Cliente, Venda } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id) || { imageUrl: '', imageHint: '' };

export const produtos: Produto[] = [
  { id: 'P001', nome: 'Relógio Inteligente', descricao: 'Relógio com monitoramento de atividades e notificações.', preco: 799.90, estoque: 45, ...findImage('smart-watch') },
  { id: 'P002', nome: 'Fone de Ouvido Bluetooth', descricao: 'Fone de ouvido sem fio com cancelamento de ruído.', preco: 499.50, estoque: 80, ...findImage('wireless-headphones') },
  { id: 'P003', nome: 'Cafeteira Expressa', descricao: 'Cafeteira automática para um café perfeito.', preco: 899.00, estoque: 25, ...findImage('coffee-maker') },
  { id: 'P004', nome: 'Mochila de Couro', descricao: 'Mochila estilosa e durável para o dia a dia.', preco: 349.99, estoque: 60, ...findImage('leather-backpack') },
  { id: 'P005', nome: 'Cadeira Ergonômica', descricao: 'Cadeira de escritório para máximo conforto.', preco: 1299.90, estoque: 15, ...findImage('ergonomic-chair') },
];

export const vendas: Venda[] = [
  { id: 'V001', cliente: 'Ana Silva', produto: 'Relógio Inteligente', quantidade: 1, total: 799.90, data: '2024-07-20', status: 'Concluído' },
  { id: 'V002', cliente: 'Bruno Costa', produto: 'Cafeteira Expressa', quantidade: 1, total: 899.00, data: '2024-07-19', status: 'Concluído' },
  { id: 'V003', cliente: 'Ana Silva', produto: 'Fone de Ouvido Bluetooth', quantidade: 1, total: 499.50, data: '2024-07-18', status: 'Concluído' },
  { id: 'V004', cliente: 'Carla Dias', produto: 'Mochila de Couro', quantidade: 1, total: 349.99, data: '2024-07-17', status: 'Pendente' },
  { id: 'V005', cliente: 'Daniel Faria', produto: 'Cadeira Ergonômica', quantidade: 1, total: 1299.90, data: '2024-07-16', status: 'Concluído' },
  { id: 'V006', cliente: 'Eduarda Lima', produto: 'Fone de Ouvido Bluetooth', quantidade: 1, total: 499.50, data: '2024-07-15', status: 'Cancelado' },
];

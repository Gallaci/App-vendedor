'use client';

import {
  addDoc,
  collection,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';
import type { AtividadeStatus, AtividadeTipo, DetalhesLigacao } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';


type NewAtividade = {
    titulo: string;
    tipo: AtividadeTipo;
    data: Timestamp;
    status: AtividadeStatus;
    createdBy: string;
    detalhes: DetalhesLigacao | any;
};

export async function addAtividade(firestore: Firestore, atividade: NewAtividade) {
  const atividadesCollection = collection(firestore, 'atividades');
  
  return addDoc(atividadesCollection, atividade).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: atividadesCollection.path,
      operation: 'create',
      requestResourceData: atividade,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

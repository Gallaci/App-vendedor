'use client';

import {
  addDoc,
  collection,
  type Firestore,
  type Timestamp
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type NewProposta = {
    cliente: string;
    produto: string;
    quantidade: number;
    total: number;
    data: Timestamp;
    status: 'Pendente';
};

export async function addProposta(firestore: Firestore, proposta: NewProposta) {
  const propostasCollection = collection(firestore, 'propostas');
  
  return addDoc(propostasCollection, proposta).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: propostasCollection.path,
      operation: 'create',
      requestResourceData: proposta,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

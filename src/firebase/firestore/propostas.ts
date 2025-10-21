'use client';

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  type Firestore,
  type Timestamp
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import type { PropostaStatus } from '@/lib/types';

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

export async function updatePropostaStatus(firestore: Firestore, propostaId: string, status: PropostaStatus) {
    const propostaRef = doc(firestore, 'propostas', propostaId);

    return updateDoc(propostaRef, { status }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: propostaRef.path,
            operation: 'update',
            requestResourceData: { status },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

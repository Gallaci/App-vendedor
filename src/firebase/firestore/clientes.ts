'use client';

import {
  addDoc,
  collection,
  type Firestore,
} from 'firebase/firestore';
import type { Cliente } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// We are defining a new type that omits the 'id' field, because Firestore generates it automatically.
type NewCliente = Omit<Cliente, 'id'>;

export async function addCliente(firestore: Firestore, cliente: NewCliente) {
  const clientesCollection = collection(firestore, 'clients');
  
  // Using .catch() for error handling as per project guidelines
  return addDoc(clientesCollection, cliente).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: clientesCollection.path,
      operation: 'create',
      requestResourceData: cliente,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error to allow for local error handling if needed
    throw serverError;
  });
}

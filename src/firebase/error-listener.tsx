'use client';

import { useEffect } from 'react';
import { errorEmitter } from './error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In a real app, you might want to log this to a service like Sentry
      // For this example, we'll just throw it to make it visible in the Next.js overlay
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}

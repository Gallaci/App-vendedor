'use client';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseErrorListener } from '@/firebase/error-listener';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
    <>
      <FirebaseErrorListener />
      {children}
    </>
    );
  }

  return <AppShell>{children}</AppShell>;
}

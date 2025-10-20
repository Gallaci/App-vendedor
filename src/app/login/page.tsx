'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { doc, setDoc, getFirestore } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const { app } = useFirebase();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (auth) {
      setFirebaseReady(true);
    }
  }, [auth]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/painel');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: 'Verifique seu e-mail e senha.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a user document in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'vendedor', // Default role for new sign-ups
        displayName: user.displayName || user.email?.split('@')[0],
      });

      toast({
        title: 'Conta Criada',
        description: 'Sua conta foi criada com sucesso. Você já pode fazer o login.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Criar Conta',
        description: 'Ocorreu um erro ao criar sua conta. Verifique os dados e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com seu email e senha para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!firebaseReady || loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!firebaseReady || loading}
            />
          </div>
        </CardContent>
        <CardContent className="grid gap-2">
          <Button onClick={handleSignIn} className="w-full" disabled={!firebaseReady || loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <Button onClick={handleSignUp} variant="outline" className="w-full" disabled={!firebaseReady || loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          {firebaseReady ? (
            <Badge variant="outline" className="border-green-600 text-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Serviço de autenticação pronto
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              Serviço de autenticação indisponível
            </Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { ready, user, configured, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace('/dashboard');
  }, [ready, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email.trim() || password.length < 6) {
      setError('Enter your email and a password of at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const result = await signIn(email.trim(), password);
        if (result.error) setError(result.error);
        else router.replace('/dashboard');
      } else {
        const result = await signUp(email.trim(), password);
        if (result.error) setError(result.error);
        else if (result.needsConfirmation)
          setNotice(
            'Almost there — check your email for a confirmation link, then sign in.'
          );
        else router.replace('/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BookOpen className="size-6 text-primary" strokeWidth={1.75} />
        <span className="font-display text-2xl font-semibold tracking-tight">
          Ledger<span className="text-gold">.</span>
        </span>
      </Link>

      <Card className="w-full max-w-sm">
        {!configured ? (
          <>
            <CardHeader>
              <CardTitle className="font-display text-2xl">
                Almost ready
              </CardTitle>
              <CardDescription>
                Supabase isn&apos;t configured yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                1. Create a free project at{' '}
                <span className="text-foreground">supabase.com</span>
              </p>
              <p>
                2. Run <code className="tabular text-xs">supabase/schema.sql</code>{' '}
                in the SQL Editor
              </p>
              <p>
                3. Copy <code className="tabular text-xs">.env.local.example</code>{' '}
                to <code className="tabular text-xs">.env.local</code> and fill in
                your project URL and anon key
              </p>
              <p>4. Restart the dev server</p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="font-display text-2xl">
                {mode === 'signin' ? 'Open your ledger' : 'Start a ledger'}
              </CardTitle>
              <CardDescription>
                {mode === 'signin'
                  ? 'Sign in to reach your book from any device.'
                  : 'One account keeps your book in sync everywhere.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
                {notice && <p className="text-xs text-primary">{notice}</p>}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting
                    ? 'One moment…'
                    : mode === 'signin'
                      ? 'Sign in'
                      : 'Create account'}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    New here?{' '}
                    <button
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have a book?{' '}
                    <button
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => { setMode('signin'); setError(''); setNotice(''); }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CircleAlert, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDocumentMeta } from '@/lib/use-document-meta';

export function AdminLogin() {
  useDocumentMeta('Admin login', 'Sign in to manage Acquire 360 Ventures website content.');
  const { user, isLoading, login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) setLocation('/admin');
  }, [isLoading, user, setLocation]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      setLocation('/admin');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--primary))] px-5 py-16">
      <div className="w-full max-w-sm border border-[hsl(var(--primary-foreground)/.15)] bg-[hsl(var(--card))] p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))]">
            <Lock size={20} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary))]">Acquire 360 Ventures</p>
          <h1 className="mt-1 text-2xl font-bold text-[hsl(var(--primary))]">Admin sign in</h1>
        </div>
        <form onSubmit={submit} className="space-y-4" data-testid="form-admin-login">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-login-email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-login-password"
            />
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-[hsl(var(--destructive))]" data-testid="status-login-error">
              <CircleAlert size={15} /> {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting} data-testid="button-login-submit">
            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            Sign in
          </Button>
        </form>
        <Link href="/" className="mt-6 block text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--secondary))]" data-testid="link-login-home">
          ← Back to the public site
        </Link>
      </div>
    </div>
  );
}

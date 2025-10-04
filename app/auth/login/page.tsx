'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully');
      const redirectTo = searchParams.get('redirect') ?? '/';
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="container-grid flex max-w-md flex-col gap-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in with your email and password.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card/60 p-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New here? <a className="text-primary" href="/auth/register">Create an account</a>
      </p>
      <p className="text-center text-sm">
        <a className="text-primary" href="/auth/reset">Forgot password?</a>
      </p>
    </div>
  );
}

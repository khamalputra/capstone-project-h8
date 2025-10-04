'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function RegisterPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created. Check your inbox to confirm email.');
      router.push('/auth/login');
    }
    setLoading(false);
  }

  return (
    <div className="container-grid flex max-w-md flex-col gap-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Create your FixIt account</h1>
        <p className="text-sm text-muted-foreground">Join as a customer or apply to become a provider.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card/60 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already registered? <a className="text-primary" href="/auth/login">Sign in</a>
      </p>
    </div>
  );
}

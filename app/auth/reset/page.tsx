'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent. Check your inbox.');
    }
    setLoading(false);
  }

  return (
    <div className="container-grid flex max-w-md flex-col gap-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your account email to receive reset instructions.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card/60 p-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it? <a className="text-primary" href="/auth/login">Back to sign in</a>
      </p>
    </div>
  );
}

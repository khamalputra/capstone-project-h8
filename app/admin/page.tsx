import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { revalidatePath } from 'next/cache';

async function approveProvider(formData: FormData) {
  'use server';
  const profile = await getProfile();
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/auth/login?redirect=/admin');
  }
  const providerId = formData.get('provider_id') as string;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('profiles').update({ role: 'PROVIDER' }).eq('id', providerId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect('/auth/login?redirect=/admin');
  }
  if (profile.role !== 'ADMIN') {
    redirect('/');
  }
  const supabase = createSupabaseServerClient();
  const { data: pending } = await supabase
    .from('profiles')
    .select('id, email, name, role')
    .eq('role', 'USER');
  const { data: services } = await supabase
    .from('services')
    .select('id, title, category, price, rating, rating_count, provider:profiles(name)')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="container-grid space-y-10 py-12">
      <div>
        <h1 className="text-3xl font-semibold">Admin control center</h1>
        <p className="text-sm text-muted-foreground">Approve providers and review marketplace inventory.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Provider applications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pending?.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <CardTitle>{provider.name ?? provider.email}</CardTitle>
                <CardDescription>Account awaiting provider approval.</CardDescription>
              </CardHeader>
              <CardFooter>
                <form action={approveProvider}>
                  <input type="hidden" name="provider_id" value={provider.id} />
                  <Button type="submit">Approve</Button>
                </form>
              </CardFooter>
            </Card>
          ))}
          {!pending?.length && <p className="text-sm text-muted-foreground">No pending applications.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Service catalog</h2>
        <div className="grid gap-4">
          {services?.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>
                  {service.category} · {service.provider?.name ?? 'Unknown provider'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Price: ${service.price}</p>
                <p>
                  Rating: {service.rating?.toFixed(1)} ({service.rating_count} reviews)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

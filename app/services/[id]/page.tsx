import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Suspense } from 'react';
import { revalidatePath } from 'next/cache';
import { bookingCreateSchema } from '@/lib/validators';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BookServiceForm } from '@/components/book-service-form';
import { Button } from '@/components/ui/button';

async function getService(id: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('services')
    .select('id, title, description, category, price, rating, rating_count, city, provider:profiles(id, name, avatar_url, phone), availability(start_ts, end_ts)')
    .eq('id', id)
    .single();
  if (!data) return null;
  return {
    ...data,
    provider: (data as any).provider,
    availability: (data as any).availability ?? []
  };
}

async function createBooking(formData: FormData) {
  'use server';

  const session = await getSession();
  if (!session) {
    redirect('/auth/login?redirect=/services');
  }

  const raw = {
    service_id: formData.get('service_id'),
    provider_id: formData.get('provider_id'),
    start_ts: formData.get('start_ts'),
    end_ts: formData.get('end_ts'),
    notes: formData.get('notes')
  };
  const parsed = bookingCreateSchema.parse(raw);

  const supabase = createSupabaseServerClient();
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('provider_id', parsed.provider_id)
    .lte('start_ts', parsed.start_ts.toISOString())
    .gte('end_ts', parsed.end_ts.toISOString())
    .maybeSingle();

  if (!availability) {
    throw new Error('Selected slot is no longer available.');
  }

  const { data: conflicts } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', parsed.provider_id)
    .eq('status', 'CONFIRMED')
    .or(`and(start_ts.lte.${parsed.end_ts.toISOString()},end_ts.gte.${parsed.start_ts.toISOString()})`);

  if (conflicts && conflicts.length) {
    throw new Error('Slot conflicts with existing confirmed booking.');
  }

  const { error } = await supabase.from('bookings').insert({
    user_id: session.user.id,
    provider_id: parsed.provider_id,
    service_id: parsed.service_id,
    start_ts: parsed.start_ts.toISOString(),
    end_ts: parsed.end_ts.toISOString(),
    notes: parsed.notes ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/bookings');
  redirect('/bookings');
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = await getService(params.id);
  if (!service) notFound();

  return (
    <div className="container-grid grid gap-12 py-12 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{service.category}</p>
          <h1 className="text-3xl font-semibold">{service.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>⭐ {service.rating?.toFixed(1)} ({service.rating_count} reviews)</span>
            <span>•</span>
            <span>{service.city ?? 'Multiple cities'}</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card/60 p-6">
          <h2 className="text-lg font-semibold">About this service</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">{service.description}</p>
        </div>
        <div className="space-y-4 rounded-xl border bg-card/60 p-6">
          <h2 className="text-lg font-semibold">Provider</h2>
          <p className="text-sm text-muted-foreground">{service.provider?.name}</p>
          <p className="text-sm text-muted-foreground">Contact: {service.provider?.phone ?? 'In-app messaging'}</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reviews</h2>
          <p className="text-sm text-muted-foreground">Reviews are coming soon. Completed bookings can leave feedback.</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card/60 p-6">
          <h2 className="text-lg font-semibold">Book this service</h2>
          <p className="text-sm text-muted-foreground">${service.price} per appointment</p>
          <Suspense fallback={<p className="mt-4 text-sm text-muted-foreground">Loading availability...</p>}>
            <BookServiceForm
              availability={service.availability}
              serviceId={service.id}
              providerId={service.provider?.id}
              action={createBooking}
            />
          </Suspense>
        </div>
        <div className="rounded-xl border bg-card/60 p-6 text-sm text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">How it works</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-4">
            <li>Select a time that works for you.</li>
            <li>The provider confirms or suggests changes.</li>
            <li>Payment is captured after service completion.</li>
          </ol>
          <Button variant="ghost" className="mt-4 w-full" asChild>
            <a href="/services">Browse more services</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

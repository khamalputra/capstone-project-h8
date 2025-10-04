import { redirect } from 'next/navigation';
import { getProfile, getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { availabilitySchema, bookingStatusSchema, servicePayloadSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

async function upsertService(formData: FormData) {
  'use server';
  const session = await getSession();
  const profile = await getProfile();
  if (!session || profile?.role !== 'PROVIDER') {
    redirect('/auth/login?redirect=/dashboard');
  }
  const payload = servicePayloadSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    price: Number(formData.get('price')),
    city: formData.get('city')
  });
  const supabase = createSupabaseServerClient();
  const existingId = formData.get('service_id') as string | null;
  const { error } = existingId
    ? await supabase.from('services').update(payload).eq('id', existingId).eq('provider_id', profile.id)
    : await supabase.from('services').insert({ ...payload, provider_id: profile.id });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
}

async function addAvailability(formData: FormData) {
  'use server';
  const profile = await getProfile();
  if (!profile || profile.role !== 'PROVIDER') {
    redirect('/auth/login?redirect=/dashboard');
  }
  const parsed = availabilitySchema.parse({
    start_ts: formData.get('start_ts'),
    end_ts: formData.get('end_ts')
  });
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('availability').insert({
    provider_id: profile.id,
    start_ts: parsed.start_ts.toISOString(),
    end_ts: parsed.end_ts.toISOString()
  });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
}

async function updateBookingStatus(formData: FormData) {
  'use server';
  const profile = await getProfile();
  if (!profile || profile.role !== 'PROVIDER') {
    redirect('/auth/login?redirect=/dashboard');
  }
  const bookingId = formData.get('booking_id') as string;
  const { status } = bookingStatusSchema.parse({ status: formData.get('status') });
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('provider_id', profile.id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
}

export default async function ProviderDashboardPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect('/auth/login?redirect=/dashboard');
  }
  if (profile.role !== 'PROVIDER') {
    return (
      <div className="container-grid py-12">
        <Card>
          <CardHeader>
            <CardTitle>Become a provider</CardTitle>
            <CardDescription>Upgrade your account to start accepting bookings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Submit an application with your expertise, service area and certifications. Our team reviews within 24 hours.</p>
            <p>Email <a href="mailto:partners@fixit.app" className="text-primary">partners@fixit.app</a> to fast-track.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/auth/register">Apply now</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: services } = await supabase
    .from('services')
    .select('id, title, description, category, price, rating, rating_count')
    .eq('provider_id', profile.id);
  const { data: availability } = await supabase
    .from('availability')
    .select('id, start_ts, end_ts')
    .eq('provider_id', profile.id)
    .order('start_ts', { ascending: true });
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, user:profiles(name), services(title), start_ts, end_ts, status, notes')
    .eq('provider_id', profile.id)
    .order('start_ts', { ascending: true });

  return (
    <div className="container-grid space-y-10 py-12">
      <div>
        <h1 className="text-3xl font-semibold">Provider dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage your services, availability and booking requests.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create or update a service</CardTitle>
            <CardDescription>Your listings appear in the marketplace instantly after saving.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertService} className="space-y-4">
              <Input name="title" placeholder="Service title" required />
              <Textarea name="description" placeholder="Describe what’s included" required />
              <Input name="category" placeholder="Category" required />
              <Input name="city" placeholder="City" required />
              <Input name="price" type="number" placeholder="Price" required />
              <Button type="submit">Save service</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Post windows when you can take new jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addAvailability} className="space-y-3">
              <Input type="datetime-local" name="start_ts" required />
              <Input type="datetime-local" name="end_ts" required />
              <Button type="submit">Add window</Button>
            </form>
            <div className="space-y-2 text-sm text-muted-foreground">
              {availability?.map((slot) => (
                <div key={slot.id} className="rounded-lg border px-3 py-2">
                  {new Date(slot.start_ts).toLocaleString()} - {new Date(slot.end_ts).toLocaleString()}
                </div>
              ))}
              {!availability?.length && <p>No availability yet.</p>}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Incoming bookings</h2>
        <div className="grid gap-4">
          {bookings?.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-col gap-1">
                <CardTitle>{booking.services?.title}</CardTitle>
                <CardDescription>
                  {booking.user?.name ?? 'Client'} · {new Date(booking.start_ts).toLocaleString()} -{' '}
                  {new Date(booking.end_ts).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Status: {booking.status}</p>
                {booking.notes && <p>Notes: {booking.notes}</p>}
              </CardContent>
              <CardFooter className="gap-2">
                <form action={updateBookingStatus}>
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input type="hidden" name="status" value="CONFIRMED" />
                  <Button type="submit" disabled={booking.status !== 'PENDING'}>
                    Confirm
                  </Button>
                </form>
                <form action={updateBookingStatus}>
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input type="hidden" name="status" value="CANCELLED" />
                  <Button type="submit" variant="outline" disabled={booking.status === 'CANCELLED'}>
                    Cancel
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
          {!bookings?.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
        </div>
      </section>
    </div>
  );
}

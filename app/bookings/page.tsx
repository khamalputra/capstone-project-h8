import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { BookingStatusBadge } from '@/components/booking-status-badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { revalidatePath } from 'next/cache';
import { EmptyState } from '@/components/empty-state';
import { differenceInHours, format } from 'date-fns';

async function cancelBooking(id: string) {
  'use server';
  const session = await getSession();
  if (!session) {
    redirect('/auth/login?redirect=/bookings');
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'CANCELLED' })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .not('status', 'in', 'COMPLETED,CANCELLED');
  if (error) throw new Error(error.message);
  revalidatePath('/bookings');
}

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login?redirect=/bookings');
  }
  const supabase = createSupabaseServerClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, service_id, start_ts, end_ts, status, notes, services(title), provider:profiles(name)')
    .eq('user_id', session.user.id)
    .order('start_ts', { ascending: false });

  if (!bookings?.length) {
    return (
      <div className="container-grid py-12">
        <EmptyState
          title="No bookings yet"
          description="Browse services to schedule your first appointment."
          action={{ label: 'Explore services', href: '/services' }}
        />
      </div>
    );
  }

  return (
    <div className="container-grid space-y-6 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">My bookings</h1>
        <p className="text-sm text-muted-foreground">Track status and manage your service appointments.</p>
      </div>
      <div className="grid gap-4">
        {bookings.map((booking) => {
          const start = new Date(booking.start_ts);
          const canCancel = differenceInHours(start, new Date()) > 4 && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
          return (
            <div key={booking.id} className="grid gap-4 rounded-xl border bg-card/60 p-6 md:grid-cols-[2fr,1fr] md:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{booking.services?.title}</h2>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  With {booking.provider?.name ?? 'your provider'} on {format(start, 'PPpp')}
                </p>
                {booking.notes && <p className="text-sm text-muted-foreground">Notes: {booking.notes}</p>}
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                {canCancel ? (
                  <ConfirmDialog
                    title="Cancel booking"
                    description="Are you sure you want to cancel this appointment?"
                    onConfirm={() => cancelBooking(booking.id)}
                    trigger={<Button variant="outline">Cancel</Button>}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">Cancellations close 4h before start time.</p>
                )}
                <Button variant="ghost" asChild>
                  <a href={`/services/${booking.service_id}`}>Book again</a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

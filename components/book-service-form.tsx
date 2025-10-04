'use client';

import { useState, useTransition } from 'react';
import { DateTimeSlotPicker } from '@/components/date-time-slot-picker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface BookServiceFormProps {
  availability: { start_ts: string; end_ts: string }[];
  serviceId: string;
  providerId: string;
  action: (formData: FormData) => Promise<void>;
}

export function BookServiceForm({ availability, serviceId, providerId, action }: BookServiceFormProps) {
  const [selected, setSelected] = useState<{ start: Date; end: Date } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (!selected) {
      toast.error('Select a time slot before booking.');
      return;
    }
    formData.set('start_ts', selected.start.toISOString());
    formData.set('end_ts', selected.end.toISOString());
    formData.set('service_id', serviceId);
    formData.set('provider_id', providerId);
    startTransition(async () => {
      try {
        await action(formData);
        toast.success('Booking requested. We will notify you once confirmed.');
      } catch (error: any) {
        toast.error(error.message ?? 'Unable to create booking');
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <DateTimeSlotPicker availability={availability} selected={selected} onSelect={setSelected} />
      <Textarea name="notes" placeholder="Optional notes for your provider" />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Request booking'}
      </Button>
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="provider_id" value={providerId} />
      <input type="hidden" name="start_ts" />
      <input type="hidden" name="end_ts" />
    </form>
  );
}

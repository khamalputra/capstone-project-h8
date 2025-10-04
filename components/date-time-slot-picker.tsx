'use client';

import { useMemo } from 'react';
import { addMinutes, format, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';

interface DateTimeSlotPickerProps {
  availability: { start_ts: string; end_ts: string }[];
  slotMinutes?: number;
  onSelect: (slot: { start: Date; end: Date }) => void;
  selected?: { start: Date; end: Date } | null;
}

export function DateTimeSlotPicker({ availability, slotMinutes = 60, onSelect, selected }: DateTimeSlotPickerProps) {
  const slots = useMemo(() => {
    const result: { start: Date; end: Date }[] = [];
    for (const window of availability) {
      const start = new Date(window.start_ts);
      const end = new Date(window.end_ts);
      let cursor = start;
      while (addMinutes(cursor, slotMinutes) <= end) {
        const slotEnd = addMinutes(cursor, slotMinutes);
        if (isBefore(new Date(), slotEnd)) {
          result.push({ start: cursor, end: slotEnd });
        }
        cursor = slotEnd;
      }
    }
    return result;
  }, [availability, slotMinutes]);

  if (!slots.length) {
    return <p className="text-sm text-muted-foreground">No availability posted. Check back later.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {slots.map((slot) => {
        const isSelected = selected && slot.start.getTime() === selected.start.getTime();
        return (
          <Button
            key={`${slot.start.toISOString()}-${slot.end.toISOString()}`}
            variant={isSelected ? 'default' : 'outline'}
            className="justify-start"
            onClick={() => onSelect(slot)}
          >
            <span className="flex flex-col text-left">
              <span className="font-medium">{format(slot.start, 'EEE, MMM d')}</span>
              <span className="text-xs text-muted-foreground">{format(slot.start, 'p')} - {format(slot.end, 'p')}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}

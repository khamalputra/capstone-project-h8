import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'outline' }
};

export function BookingStatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

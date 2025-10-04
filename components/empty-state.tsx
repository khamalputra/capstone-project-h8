import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string } | ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {typeof action === 'object' && 'href' in action ? (
        <Button asChild>
          <a href={action.href}>{action.label}</a>
        </Button>
      ) : (
        action ?? null
      )}
    </div>
  );
}

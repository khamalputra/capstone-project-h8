import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  ratingCount: number;
  city?: string | null;
  providerName?: string | null;
}

export function ServiceCard({ id, title, description, category, price, rating, ratingCount, city, providerName }: ServiceCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{title}</span>
          <span className="text-sm text-muted-foreground">{category}</span>
        </CardTitle>
        <CardDescription>
          {providerName ? `by ${providerName}` : 'Verified provider'} · {city ?? 'Multiple cities'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
        <p>{description.slice(0, 160)}...</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">${price}</span>
          <span className="text-xs">per job</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>⭐ {rating.toFixed(1)}</span>
          <span>({ratingCount})</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/services/${id}`}>View details</Link>
        </Button>
        <Button asChild>
          <Link href={`/services/${id}?action=book`}>Book now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

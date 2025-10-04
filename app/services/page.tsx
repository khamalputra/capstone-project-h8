import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { serviceFilterSchema } from '@/lib/validators';
import { ServiceCard } from '@/components/service-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

async function fetchServices(params: Record<string, string | string[] | undefined>) {
  const supabase = createSupabaseServerClient();
  const filters = serviceFilterSchema.parse({
    search: params.search,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minRating: params.minRating,
    city: params.city,
    page: params.page
  });

  const query = supabase
    .from('services')
    .select('id, title, description, category, price, rating, rating_count, city, provider:profiles(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((filters.page - 1) * 12, filters.page * 12 - 1);

  if (filters.search) {
    query.ilike('title', `%${filters.search}%`);
  }
  if (filters.category) {
    query.eq('category', filters.category);
  }
  if (filters.minPrice) {
    query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice) {
    query.lte('price', filters.maxPrice);
  }
  if (filters.minRating) {
    query.gte('rating', filters.minRating);
  }
  if (filters.city) {
    query.eq('city', filters.city);
  }

  const { data, count } = await query;
  const services =
    data?.map((service) => ({
      ...service,
      providerName: (service as any).provider?.name ?? null
    })) ?? [];

  return { services, count: count ?? 0, filters };
}

export default async function ServicesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { services, count, filters } = await fetchServices(searchParams);
  const totalPages = Math.ceil(count / 12) || 1;

  return (
    <div className="container-grid space-y-10 py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Find your next pro</h1>
        <p className="text-sm text-muted-foreground">
          Browse verified service providers with upfront pricing and real customer ratings.
        </p>
      </div>
      <form className="grid gap-4 rounded-xl border bg-card/60 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input name="search" defaultValue={filters.search ?? ''} placeholder="Search by service name" />
          <Input name="city" defaultValue={filters.city ?? ''} placeholder="City" />
          <Select name="category" defaultValue={filters.category ?? ''}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {['Cleaning', 'AC Repair', 'Plumbing', 'Electrical', 'Handyman', 'Landscaping'].map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Input name="minPrice" type="number" defaultValue={filters.minPrice?.toString() ?? ''} placeholder="Min price" />
          <Input name="maxPrice" type="number" defaultValue={filters.maxPrice?.toString() ?? ''} placeholder="Max price" />
          <Input name="minRating" type="number" step="0.5" defaultValue={filters.minRating?.toString() ?? ''} placeholder="Min rating" />
          <Button type="submit">Apply filters</Button>
        </div>
      </form>

      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.title}
              description={service.description}
              category={service.category}
              price={service.price}
              rating={service.rating}
              ratingCount={service.rating_count}
              city={service.city}
              providerName={service.providerName}
            />
          ))}
        </div>
      </Suspense>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(filters.page - 1) * 12 + 1} - {Math.min(filters.page * 12, count)} of {count}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild disabled={filters.page <= 1}>
            <Link href={{ pathname: '/services', query: { ...filters, page: filters.page - 1 } }}>Prev</Link>
          </Button>
          <Button variant="outline" asChild disabled={filters.page >= totalPages}>
            <Link href={{ pathname: '/services', query: { ...filters, page: filters.page + 1 } }}>Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

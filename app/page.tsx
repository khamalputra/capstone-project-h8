import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { createSupabaseServerClient } from '@/lib/supabase';
import { serviceFilterSchema } from '@/lib/validators';

async function getFeaturedServices() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('services')
    .select('id, title, description, category, price, rating, rating_count, city, provider:profiles(name)')
    .order('rating', { ascending: false })
    .limit(6);
  return (
    data?.map((service) => ({
      ...service,
      providerName: (service as any).provider?.name ?? null
    })) ?? []
  );
}

export default async function LandingPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const featured = await getFeaturedServices();
  const filters = serviceFilterSchema.partial().parse(searchParams);

  return (
    <div className="space-y-16 pb-20">
      <section className="bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container-grid grid gap-10 py-20 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Now live in 40+ cities</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Book trusted home services without the back-and-forth.</h1>
            <p className="text-lg text-muted-foreground">
              FixIt is your modern marketplace for vetted professionals in cleaning, HVAC, plumbing and maintenance. Search, compare and book in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={{ pathname: '/services', query: filters }}>Explore services</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Become a provider</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 rounded-2xl border bg-card/60 p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Popular categories</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {['Cleaning', 'AC Repair', 'Plumbing', 'Electrical', 'Handyman', 'Landscaping'].map((category) => (
                <Link
                  key={category}
                  className="rounded-lg border bg-background px-4 py-3 font-medium transition hover:border-primary hover:text-primary"
                  href={{ pathname: '/services', query: { category } }}
                >
                  {category}
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Verified providers · Background checked · Transparent pricing</p>
          </div>
        </div>
      </section>

      <section className="container-grid space-y-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Top-rated providers</h2>
            <p className="text-sm text-muted-foreground">Handpicked based on ratings and response time.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/services">Browse all services</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((service) => (
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
      </section>
    </div>
  );
}

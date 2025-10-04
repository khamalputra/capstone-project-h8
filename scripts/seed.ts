import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error('Missing Supabase configuration.');
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

async function seed() {
  console.log('Seeding demo data...');

  const providers = [
    { email: 'alex@fixit.app', name: 'Alex Turner', phone: '+1-555-1234', categories: ['Cleaning'] },
    { email: 'jules@fixit.app', name: 'Jules Carter', phone: '+1-555-9876', categories: ['Plumbing'] },
    { email: 'mia@fixit.app', name: 'Mia Chen', phone: '+1-555-4321', categories: ['AC Repair'] }
  ];

  for (const provider of providers) {
    const id = randomUUID();
    await supabase.from('profiles').upsert({
      id,
      email: provider.email,
      name: provider.name,
      phone: provider.phone,
      role: 'PROVIDER'
    });
    await supabase.from('services').insert([
      {
        provider_id: id,
        title: `${provider.categories[0]} Essentials`,
        description: 'Full-service appointment including diagnostics, supplies and satisfaction guarantee.',
        category: provider.categories[0],
        price: 120,
        rating: 4.7,
        rating_count: 25,
        city: 'San Francisco'
      }
    ]);
    const start = new Date();
    for (let i = 1; i <= 3; i++) {
      const slotStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);
      await supabase.from('availability').insert({
        provider_id: id,
        start_ts: slotStart.toISOString(),
        end_ts: slotEnd.toISOString()
      });
    }
  }

  const userId = randomUUID();
  await supabase.from('profiles').upsert({
    id: userId,
    email: 'customer@fixit.app',
    name: 'Demo Customer',
    role: 'USER'
  });

  console.log('Seed data complete.');
}

seed();

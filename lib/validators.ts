import { z } from 'zod';

export const serviceFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  city: z.string().optional(),
  page: z.coerce.number().min(1).default(1)
});

export const servicePayloadSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  price: z.number().int().positive(),
  city: z.string().min(2)
});

export const availabilitySchema = z.object({
  start_ts: z.coerce.date(),
  end_ts: z.coerce.date()
}).refine((data) => data.end_ts > data.start_ts, {
  message: 'End time must be after start time',
  path: ['end_ts']
});

export const bookingCreateSchema = z
  .object({
    service_id: z.string().uuid(),
    provider_id: z.string().uuid(),
    start_ts: z.coerce.date(),
    end_ts: z.coerce.date(),
    notes: z.string().max(500).optional()
  })
  .refine((data) => data.end_ts > data.start_ts, {
    message: 'End time must be after start time',
    path: ['end_ts']
  });

export const bookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
});

export const providerApplicationSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  bio: z.string().min(20),
  categories: z.array(z.string().min(2)).min(1)
});

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  service_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10)
});

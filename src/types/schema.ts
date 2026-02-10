import { z } from 'zod';

export const eventSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  landscapePoster: z.any().optional(), // FileList for file upload
  portraitPoster: z.any().optional(), // FileList for file upload
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
  ageLimit: z.string().min(1, 'Age limit is required'),
  language: z.string().min(1, 'Language is required'),
  category: z.string().min(1, 'Category is required'),
  eventType: z.string().min(1, 'Event type is required'),
  venue: z.string().min(1, 'Venue is required'),
  price: z.string().min(1, 'Price is required'),
  description: z.string().min(1, 'Description is required'),
  performers: z.string().min(1, 'Performers are required'),
  campus_slug: z.string().optional(), // Optional campus mapping for better event categorization
  subtype_slug: z.string().optional(), // Optional subtype mapping
  isTeamEvent: z.boolean().optional().default(false),
  minTeamSize: z.number().min(1).max(50).optional(),
  maxTeamSize: z.number().min(1).max(50).optional()
});

export type EventFormData = z.infer<typeof eventSchema>;

export interface EventData extends EventFormData {
  id: string;
  slug: string;
  creator_email: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  event_id: string;
  user_email: string;
  quantity: number;
  amount_paise: number;
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
  updated_at: string;
  event?: EventData;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  username?: string;
}
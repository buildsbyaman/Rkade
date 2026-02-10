import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { EventFormData } from './schema';

export interface FormSectionBaseProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
}

export interface EventResponse {
  id: string;
  event_name: string;
  slug: string;
  landscape_poster: string;
  portrait_poster: string;
  date: string | null;
  time: string;
  duration: string;
  age_limit: string;
  event_type: string;
  language: string;
  category: string;
  venue: string;
  price: string;
  description: string;
  performers: string;
  creator_email: string;
  created_at: string;
  updated_at: string;
}

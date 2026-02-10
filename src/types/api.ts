import { EventResponse } from './events';


export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  events?: EventResponse[];
  bookings?: EventResponse[];
}

export type ApiPromise<T> = Promise<ApiResponse<T>>;
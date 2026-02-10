export interface GoogleMapsError extends Error {
  message: string;
}

export interface GoogleResponse<T> {
  data?: T;
  error?: GoogleMapsError;
}
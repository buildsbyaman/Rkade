/// <reference types="google.maps" />
'use client';

import React, { useEffect } from 'react';
import { FormSectionBaseProps } from '@/types/events';
import { UseFormSetValue } from 'react-hook-form';
import { EventFormData } from '@/types/schema';

interface Props extends FormSectionBaseProps {
  setValue: UseFormSetValue<EventFormData>;}

export function VenueAndDetails({ register, errors, setValue }: Props) {
  useEffect(() => {
    function loadGoogleMaps(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.google?.maps?.places) {
          resolve();
          return;
        };
        const existing = document.getElementById('google-maps-js');
        if (existing) {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', (e) => reject(e));
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps-js';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let autocompleteListener: google.maps.MapsEventListener | null = null;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled) return;
        const input = document.getElementById('venue-input') as HTMLInputElement | null;
        if (!input || !window.google?.maps?.places) return;
        
        const options: google.maps.places.AutocompleteOptions = {
          types: ['establishment', 'geocode'],
          fields: ['formatted_address', 'geometry', 'name', 'address_components']
        };

        try {
          const autocomp = new window.google.maps.places.Autocomplete(input, options);
          // Cast to the correct type
          autocomplete = autocomp as unknown as google.maps.places.Autocomplete;

          if (autocomplete) {
            autocompleteListener = google.maps.event.addListener(autocomplete, 'place_changed', () => {
              if (!autocomplete) return;
              const place = autocomplete.getPlace();
              const value = place.formatted_address || place.name || '';
              if (value) {
                setValue('venue', value, { shouldDirty: true, shouldValidate: true });
              }
            });
          }
        } catch (error) {
          console.error('Error initializing Google Maps Autocomplete:', error);
        }
      })
      .catch((error: Error) => {
        console.error('Error loading Google Maps:', error);
      });

    return () => {
      cancelled = true;
      // Clean up event listeners
      if (autocompleteListener) {
        autocompleteListener.remove();
      }
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [setValue]);

  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-white mb-4">Location & Pricing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm mb-2">
            <span className="flex items-center gap-2">
              Add Event Location
            </span>
            <span className="text-xs opacity-75">Offline location or virtual link</span>
          </label>
          <input 
            id="venue-input" 
            type="text"
            {...register('venue')} 
            placeholder="Venue (search or select)" 
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
          />
          {errors.venue && <p className="text-red-300 text-sm mt-1">{errors.venue.message?.toString()}</p>}
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">
            <span className="flex items-center gap-2">
              Tickets
            </span>
          </label>
          <input 
            type="text"
            {...register('price')} 
            placeholder="Free" 
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
          />
          {errors.price && <p className="text-red-300 text-sm mt-1">{errors.price.message?.toString()}</p>}
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm ">Add Description</label>
        <textarea 
          {...register('description')} 
          placeholder="Tell people about your event..." 
          className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all h-32 resize-none" 
        />
        {errors.description && <p className="text-red-300 text-sm mt-1">{errors.description.message?.toString()}</p>}
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">Performer(s)</label>
        <input 
          type="text"
          {...register('performers')} 
          placeholder="Artist or performer names" 
          className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
        />
        {errors.performers && <p className="text-red-300 text-sm mt-1">{errors.performers.message?.toString()}</p>}
      </div>
    </div>
  );
}



'use client';

import React from 'react';

interface Option { id: string; name?: string; slug: string; code?: string }

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { EventFormData } from '@/types/schema';

interface Props {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  eventTypes: Option[];
  ageRatings: Option[];
  languages: Option[];
  categories: Option[];
}

export function MasterSelects({ register, errors, eventTypes, ageRatings, languages, categories }: Props) {
  const selectClassName = "w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all";
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Event Category & Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm mb-2">Event Type</label>
          <select {...register('eventType', { required: 'Please select an event type' })} className={selectClassName} defaultValue="">
            <option value="" disabled className="text-gray-500">Select Event Type</option>
            {eventTypes.map(t => (
              <option key={t.id} value={t.slug} className="text-gray-900">{t.name}</option>
            ))}
          </select>
          {errors.eventType && <p className="text-red-300 text-sm mt-1">{errors.eventType.message}</p>}
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Age Rating</label>
          <select {...register('ageLimit')} className={selectClassName} defaultValue="">
            <option value="" disabled className="text-gray-500">Select Age Rating</option>
            {ageRatings.map(a => (
              <option key={a.id} value={a.code} className="text-gray-900">{a.code}{a.name ? ` - ${a.name}` : ''}</option>
            ))}
          </select>
          {errors.ageLimit && <p className="text-red-300 text-sm mt-1">{errors.ageLimit.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm mb-2">Language</label>
          <select {...register('language')} className={selectClassName} defaultValue="">
            <option value="" disabled className="text-gray-500">Select Language</option>
            {languages.map(l => (
              <option key={l.id} value={l.slug} className=" text-sm mb-2 text-gray-900">{l.name}</option>
            ))}
          </select>
          {errors.language && <p className="text-red-300 text-sm mt-1">{errors.language.message}</p>}
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Category</label>
          <select {...register('category')} className={selectClassName} defaultValue="">
            <option value="" disabled className="text-gray-500">Select Category</option>
            
            {/* Group sports categories together */}
            <optgroup label="Sports">
              {categories
                .filter(c => ['cricket', 'hockey', 'boxing', 'football', 'basketball', 'tennis', 'badminton', 'swimming', 'athletics', 'volleyball'].includes(c.slug))
                .map(c => (
                  <option key={c.id} value={c.slug} className="text-gray-900">{c.name}</option>
                ))
              }
            </optgroup>
            
            {/* Other categories */}
            <optgroup label="Other Events">
              {categories
                .filter(c => !['cricket', 'hockey', 'boxing', 'football', 'basketball', 'tennis', 'badminton', 'swimming', 'athletics', 'volleyball'].includes(c.slug))
                .map(c => (
                  <option key={c.id} value={c.slug} className="text-gray-900">{c.name}</option>
                ))
              }
            </optgroup>
          </select>
          {errors.category && <p className="text-red-300 text-sm mt-1">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">Campus/Category (Optional)</label>
        <select {...register('campus_slug')} className={selectClassName} defaultValue="">
          <option value="" className="text-gray-500">Select Campus/Category Page (Optional)</option>
          <optgroup label="Educational Campuses">
            <option value="iit-delhi" className="text-gray-900">IIT Delhi</option>
            <option value="delhi-university" className="text-gray-900">Delhi University</option>
            <option value="dtu-delhi" className="text-gray-900">DTU Delhi</option>
            <option value="maharaja-agarsen" className="text-gray-900">Maharaja Agarsen College</option>
            <option value="aiims-delhi" className="text-gray-900">AIIMS Delhi</option>
            <option value="nit-delhi" className="text-gray-900">NIT Delhi</option>
          </optgroup>
          <optgroup label="Sports Categories">
            <option value="cricket" className="text-gray-900">Cricket</option>
            <option value="hockey" className="text-gray-900">Hockey</option>
            <option value="football" className="text-gray-900">Football</option>
            <option value="boxing" className="text-gray-900">Boxing</option>
            <option value="tennis" className="text-gray-900">Tennis</option>
            <option value="kabbadi" className="text-gray-900">Kabbadi</option>
          </optgroup>
          <optgroup label="Artists/Music">
            <option value="diljit-dosanjh" className="text-gray-900">Diljit Dosanjh</option>
            <option value="karan-aujla" className="text-gray-900">Karan Aujla</option>
            <option value="punjabi" className="text-gray-900">Punjabi Music</option>
            <option value="yo-yo-prateek" className="text-gray-900">Yo YO Prateek</option>
          </optgroup>
        </select>
        {errors.campus_slug && <p className="text-red-300 text-sm mt-1">{errors.campus_slug.message}</p>}
      </div>
    </div>
  );
}



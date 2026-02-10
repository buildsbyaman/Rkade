'use client';

import React, { useState } from 'react';
import { FormSectionBaseProps } from '@/types/events';

type Props = FormSectionBaseProps;

export function DateTimeSection({ register, errors }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Schedule</h3>
        
        {/* Desktop Layout - Full Form */}
        <div className="hidden md:block space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Start Date</label>
              <input 
                type="date" 
                {...register('date')} 
                className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Start Time</label>
              <input 
                type="time" 
                {...register('time')} 
                className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
              />
              {errors.time && <p className="text-red-300 text-sm mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Duration</label>
            <input 
              {...register('duration')} 
              placeholder="e.g., 2 hours, 90 minutes" 
              className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
            />
            {errors.duration && <p className="text-red-300 text-sm mt-1">{errors.duration.message}</p>}
          </div>
        </div>

        {/* Mobile Layout - Compact Button */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all flex items-center justify-between"
          >
            <span> Set Date & Time</span>
            
          </button>
        </div>
      </div>

      {/* Mobile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Schedule Details</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Start Date</label>
                <input 
                  type="date" 
                  {...register('date')} 
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">Start Time</label>
                <input 
                  type="time" 
                  {...register('time')} 
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
                />
                {errors.time && <p className="text-red-300 text-sm mt-1">{errors.time.message}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Duration</label>
                <input 
                  {...register('duration')} 
                  placeholder="e.g., 2 hours, 90 minutes" 
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
                />
                {errors.duration && <p className="text-red-300 text-sm mt-1">{errors.duration.message}</p>}
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-6 p-4 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



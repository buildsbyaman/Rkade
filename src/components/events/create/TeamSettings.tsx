import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { EventFormData } from '@/types/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TeamSettingsProps {
  register: UseFormRegister<EventFormData>;
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  errors: FieldErrors<EventFormData>;
}

export function TeamSettings({ register, watch, setValue, errors }: TeamSettingsProps) {
  const isTeamEvent = watch('isTeamEvent');
  const eventType = watch('eventType');
  
  // Debug logging
  console.log('TeamSettings - eventType:', eventType, 'isTeamEvent:', isTeamEvent);
  console.log('Available event types for comparison:', eventType);
  
  // Show team settings for any event type that's selected (more flexible approach)
  // You can modify this condition based on your specific needs
  const shouldShowTeamSettings = Boolean(eventType && eventType.trim() !== '');

  if (!shouldShowTeamSettings) {
    console.log('TeamSettings hidden - no eventType selected');
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Team Settings</h3>
      
      <div className="flex items-center space-x-3 mb-4">
        <input
          type="checkbox"
          id="isTeamEvent"
          {...register('isTeamEvent')}
          onChange={(e) => {
            setValue('isTeamEvent', e.target.checked);
            if (!e.target.checked) {
              setValue('minTeamSize', undefined);
              setValue('maxTeamSize', undefined);
            }
          }}
          className="w-5 h-5 text-teal-400 bg-white/10 border-white/30 rounded focus:ring-teal-400 focus:ring-2"
        />
          <label htmlFor="isTeamEvent" className="text-white font-medium">
          🔗 Require Approval
        </label>
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/70 text-sm">Enable team registration for this event</span>
          <div className="w-12 h-6 bg-white/20 rounded-full relative transition-colors duration-200">
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${isTeamEvent ? 'transform translate-x-6 bg-teal-400' : ''}`}></div>
          </div>
        </div>
      </div>

      {isTeamEvent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-white/80 text-sm mb-2">👥 Capacity</label>
            <input
              id="minTeamSize"
              type="number"
              min="1"
              max="50"
              placeholder="Minimum (e.g., 2)"
              {...register('minTeamSize', { 
                valueAsNumber: true,
                required: isTeamEvent ? 'Minimum team size is required for team events' : false
              })}
              className={`w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all ${errors.minTeamSize ? 'border-red-400' : ''}`}
            />
            {errors.minTeamSize && (
              <p className="text-red-300 text-sm mt-1">{errors.minTeamSize.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Maximum Team Size</label>
            <input
              id="maxTeamSize"
              type="number"
              min="1"
              max="50"
              placeholder="Maximum (e.g., 5)"
              {...register('maxTeamSize', { 
                valueAsNumber: true,
                required: isTeamEvent ? 'Maximum team size is required for team events' : false
              })}
              className={`w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all ${errors.maxTeamSize ? 'border-red-400' : ''}`}
            />
            {errors.maxTeamSize && (
              <p className="text-red-300 text-sm mt-1">{errors.maxTeamSize.message}</p>
            )}
          </div>
        </div>
      )}

      {isTeamEvent && (
        <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
          <p className="text-teal-200 text-sm">
            <strong>Team Event Settings:</strong>
            <br />
            • Participants will be able to create or join teams
            <br />
            • Each team will receive a unique 6-digit alphanumeric code
            <br />
            • Team size will be enforced between the min and max values you set
          </p>
        </div>
      )}
    </div>
  );
}
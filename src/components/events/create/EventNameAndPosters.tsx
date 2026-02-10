'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FormSectionBaseProps } from '@/types/events';
import { UseFormWatch } from 'react-hook-form';
import { EventFormData } from '@/types/schema';

type Props = FormSectionBaseProps & {
  watch?: UseFormWatch<EventFormData>;
  setValue?: (name: keyof EventFormData, value: EventFormData[keyof EventFormData]) => void;
  onFileChange?: (field: 'portraitPoster' | 'landscapePoster', files: FileList | null) => void;
};

export function EventNameAndPosters({ register, errors, watch, setValue, onFileChange }: Props) {
  const [previewModal, setPreviewModal] = useState<{ type: 'landscape' | 'portrait' | null; file: File | null }>({ type: null, file: null });
  const [hasLandscapeFile, setHasLandscapeFile] = useState(false);
  const [hasPortraitFile, setHasPortraitFile] = useState(false);
  
  // Store files locally for mobile preview
  const [localLandscapeFile, setLocalLandscapeFile] = useState<File | null>(null);
  const [localPortraitFile, setLocalPortraitFile] = useState<File | null>(null);

  const createPreviewUrl = (fileList: FileList | null | undefined): string | null => {
    if (!fileList || fileList.length === 0) return null;
    const file = fileList[0];
    if (!(file instanceof File)) return null;
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return null;
    }
  };

  const handlePreview = (type: 'landscape' | 'portrait') => {
    console.log('🔍 handlePreview called with type:', type);
    
    // Use local file state for mobile preview (more reliable than React Hook Form watch)
    const file = type === 'landscape' ? localLandscapeFile : localPortraitFile;
    
    console.log('📁 Checking local file state for', type, ':', file ? file.name : 'no file');
    
    if (file && file instanceof File) {
      console.log('✅ Found file in local state:', file.name, file.size);
      setPreviewModal({ type, file });
    } else {
      console.log('❌ No file found in local state');
      alert(`Please upload a ${type} image first.`);
    }
  };



  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
      

      
      <div>
        <input 
          {...register('eventName')} 
          placeholder="Event Name" 
          className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all" 
        />
        {errors.eventName && <p className="text-red-300 text-sm mt-1">{errors.eventName.message}</p>}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        {/* Landscape Photo Upload */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Landscape Image
            <span className="text-xs opacity-75 block">Recommended: 1920x1080px</span>
          </label>
          <div className="relative">
            <input
              id="desktop-landscapePoster"
              type="file"
              accept="image/*"
              {...register('landscapePoster')}
              onChange={(e) => {
                console.log('📸 Desktop landscape file changed:', e.target.files);
                // Call React Hook Form's onChange first
                const registerProps = register('landscapePoster');
                if (registerProps.onChange) {
                  registerProps.onChange(e);
                }
                // Then notify parent component
                if (onFileChange) {
                  onFileChange('landscapePoster', e.target.files);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full p-4 bg-white/5 border border-white/20 rounded-lg border-dashed text-center hover:bg-white/10 transition-all">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/70 text-sm">Upload Landscape Image</p>
                <p className="text-white/50 text-xs">Click or drag to upload</p>
              </div>
            </div>
          </div>
          {errors.landscapePoster && <p className="text-red-300 text-sm mt-1">{String(errors.landscapePoster.message || 'Invalid landscape poster')}</p>}
        </div>

        {/* Portrait Photo Upload */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Portrait Image
            <span className="text-xs opacity-75 block">Recommended: 1080x1920px</span>
          </label>
          <div className="relative">
            <input
              id="desktop-portraitPoster"
              type="file"
              accept="image/*"
              {...register('portraitPoster')}
              onChange={(e) => {
                console.log('📸 Desktop portrait file changed:', e.target.files);
                // Call React Hook Form's onChange first
                const registerProps = register('portraitPoster');
                if (registerProps.onChange) {
                  registerProps.onChange(e);
                }
                // Then notify parent component
                if (onFileChange) {
                  onFileChange('portraitPoster', e.target.files);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full p-4 bg-white/5 border border-white/20 rounded-lg border-dashed text-center hover:bg-white/10 transition-all">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/70 text-sm">Upload Portrait Image</p>
                <p className="text-white/50 text-xs">Click or drag to upload</p>
              </div>
            </div>
          </div>
          {errors.portraitPoster && <p className="text-red-300 text-sm mt-1">{String(errors.portraitPoster.message || 'Invalid portrait poster')}</p>}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Mobile Landscape Upload */}
          <div>
            <div className="relative">
              <input
                id="mobile-landscapePoster"
                type="file"
                accept="image/*"
                {...register('landscapePoster')}
                onChange={(e) => {
                  const hasFiles = Boolean(e.target.files && e.target.files.length > 0);
                  const file = hasFiles ? e.target.files![0] : null;
                  console.log('📸 Mobile landscape file changed:', hasFiles ? file!.name : 'no file');
                  
                  setHasLandscapeFile(hasFiles);
                  setLocalLandscapeFile(file); // Store for local preview
                  
                  // Call React Hook Form's onChange first
                  const registerProps = register('landscapePoster');
                  if (registerProps.onChange) {
                    registerProps.onChange(e);
                  }
                  
                  // Notify parent component for preview
                  if (onFileChange) {
                    onFileChange('landscapePoster', e.target.files);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full aspect-video bg-white/5 border border-white/20 rounded-lg border-dashed text-center hover:bg-white/10 transition-all flex flex-col items-center justify-center p-2">
                <svg className="w-6 h-6 text-white/40 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/70 text-xs">Landscape</p>
                <p className="text-white/50 text-[10px]">1920x1080</p>
              </div>
            </div>
            {hasLandscapeFile && (
              <button
                type="button"
                onClick={() => handlePreview('landscape')}
                className="w-full mt-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white/80 text-xs rounded-md transition-all"
              >
                📷 View Landscape
              </button>
            )}
            {errors.landscapePoster && <p className="text-red-300 text-[10px] mt-1">{String(errors.landscapePoster.message || 'Invalid')}</p>}
          </div>

          {/* Mobile Portrait Upload */}
          <div>
            <div className="relative">
              <input
                id="mobile-portraitPoster"
                type="file"
                accept="image/*"
                {...register('portraitPoster')}
                onChange={(e) => {
                  const hasFiles = Boolean(e.target.files && e.target.files.length > 0);
                  const file = hasFiles ? e.target.files![0] : null;
                  console.log('📸 Mobile portrait file changed:', hasFiles ? file!.name : 'no file');
                  
                  setHasPortraitFile(hasFiles);
                  setLocalPortraitFile(file); // Store for local preview
                  
                  // Call React Hook Form's onChange first
                  const registerProps = register('portraitPoster');
                  if (registerProps.onChange) {
                    registerProps.onChange(e);
                  }
                  
                  // Notify parent component for preview
                  if (onFileChange) {
                    onFileChange('portraitPoster', e.target.files);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full aspect-[3/4] bg-white/5 border border-white/20 rounded-lg border-dashed text-center hover:bg-white/10 transition-all flex flex-col items-center justify-center p-2">
                <svg className="w-6 h-6 text-white/40 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/70 text-xs">Portrait</p>
                <p className="text-white/50 text-[10px]">1080x1920</p>
              </div>
            </div>
            {hasPortraitFile && (
              <button
                type="button"
                onClick={() => handlePreview('portrait')}
                className="w-full mt-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white/80 text-xs rounded-md transition-all"
              >
                📷 View Portrait
              </button>
            )}
            {errors.portraitPoster && <p className="text-red-300 text-[10px] mt-1">{String(errors.portraitPoster.message || 'Invalid')}</p>}
          </div>
        </div>
      </div>

      
      {/* Photo Preview Modal */}
      {previewModal.type && previewModal.file && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={(e) => e.target === e.currentTarget && setPreviewModal({ type: null, file: null })}>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {previewModal.type === 'landscape' ? 'Landscape' : 'Portrait'} Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModal({ type: null, file: null })}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <Image 
                src={URL.createObjectURL(previewModal.file)}
                alt={`${previewModal.type} preview`}
                width={400}
                height={previewModal.type === 'landscape' ? 225 : 533}
                className={`w-full rounded-lg object-cover ${
                  previewModal.type === 'landscape' ? 'aspect-video' : 'aspect-[3/4]'
                }`}
                unoptimized
              />
            </div>
            
            <button
              type="button"
              onClick={() => setPreviewModal({ type: null, file: null })}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



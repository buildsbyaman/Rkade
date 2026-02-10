'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    aspectRatio: 'landscape' | 'portrait';
}

export function ImageUpload({ label, value, onChange, aspectRatio }: ImageUploadProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempUrl, setTempUrl] = useState(value);

    const handleSave = () => {
        onChange(tempUrl);
        setIsEditing(false);
    };

    const handleClear = () => {
        setTempUrl('');
        onChange('');
        setIsEditing(false);
    };

    const aspectClass = aspectRatio === 'landscape' ? 'aspect-video' : 'aspect-[3/4]';

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">{label}</label>

            {value && !isEditing ? (
                <div className="relative group">
                    <div className={cn("w-full overflow-hidden rounded-xl border-2 border-gray-200 dark:border-white/10", aspectClass)}>
                        <img
                            src={value}
                            alt={label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EError%3C/text%3E%3C/svg%3E';
                            }}
                        />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Edit"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 bg-white dark:bg-gray-800 text-red-600 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className={cn("w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 flex items-center justify-center", aspectClass)}>
                        {tempUrl ? (
                            <img
                                src={tempUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        ) : (
                            <div className="text-center p-8">
                                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter image URL below
                                </p>
                            </div>
                        )}
                    </div>

                    <input
                        type="url"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!tempUrl}
                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Set Image
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setTempUrl(value);
                                    setIsEditing(false);
                                }}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-foreground rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

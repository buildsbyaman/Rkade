import React from 'react';
import Image from "next/image";

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

export function Avatar({ className = "", children }: AvatarProps) {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function AvatarImage({ src, alt, className = "" }: AvatarImageProps) {
  if (!src) return null;
  
  return (
    <Image
      src={src}
      alt={alt || ''}
      width={100}
      height={100}
      className={`aspect-square h-full w-full object-cover ${className}`}
    />
  );
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

export function AvatarFallback({ className = "", children }: AvatarFallbackProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-zinc-100 text-zinc-600 ${className}`}>
      {children}
    </div>
  );
}
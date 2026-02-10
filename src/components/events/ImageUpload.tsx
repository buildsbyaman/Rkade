"use client";

import { useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  bucket: string;
  onUpload: (url: string) => void;
  aspectRatio?: "portrait" | "landscape";
  className?: string;
}

export function ImageUpload({
  label,
  bucket,
  onUpload,
  aspectRatio = "landscape",
  className = "",
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = () => {
    try {
      setError(null);
      if (!inputUrl.trim()) {
        setError("Please enter an image URL");
        return;
      }

      // Basic URL validation
      try {
        new URL(inputUrl);
      } catch {
        setError("Please enter a valid URL");
        return;
      }

      setImageUrl(inputUrl);
      onUpload(inputUrl);
      setInputUrl("");
    } catch (err: any) {
      setError(err.message || "Error setting image");
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setInputUrl("");
    onUpload("");
  };

  const ratioClass =
    aspectRatio === "portrait"
      ? "aspect-[3/4] max-w-[240px]"
      : "aspect-video max-w-[400px]";

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>

      {imageUrl ? (
        <div
          className={`relative ${ratioClass} w-full overflow-hidden rounded-lg border border-white/20 group`}
        >
          <Image
            src={imageUrl}
            alt="Uploaded image"
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <button
            onClick={removeImage}
            type="button"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center ${ratioClass} w-full rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-acid/50 transition-all group space-y-3 p-4`}
        >
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-3 rounded-full bg-white/5 group-hover:bg-acid/20 transition-colors">
              <LinkIcon className="h-6 w-6 text-gray-400 group-hover:text-acid transition-colors" />
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-white group-hover:text-acid transition-colors">
                Enter Image URL
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              {aspectRatio === "landscape" ? "Landscape" : "Portrait"}
            </p>
          </div>
          <div className="w-full flex gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-acid/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 rounded-lg bg-acid text-black font-medium text-sm hover:bg-acid/90 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

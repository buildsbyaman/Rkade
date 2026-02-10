"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal has been shown in this session
    const hasSeenModal = sessionStorage.getItem("promoModalSeen");
    
    if (!hasSeenModal) {
      // Show modal after a short delay when component mounts
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark modal as seen in this session
    sessionStorage.setItem("promoModalSeen", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Desktop Image (landscape) - hidden on mobile */}
        <div className="hidden md:block relative w-full h-auto">
          <Image
            src="/Assests/aifest-landscape.jpg"
            alt="AI Fest Promotion"
            width={1200}
            height={675}
            className="rounded-lg shadow-2xl w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Mobile Image (portrait) - hidden on desktop */}
        <div className="block md:hidden relative w-full h-auto max-h-[80vh]">
          <Image
            src="/Assests/aifest-portrait.jpg"
            alt="AI Fest Promotion"
            width={675}
            height={1200}
            className="rounded-lg shadow-2xl w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

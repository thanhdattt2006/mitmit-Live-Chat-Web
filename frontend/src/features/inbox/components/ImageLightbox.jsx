import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ImageLightbox({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-neutral-800/50 hover:bg-neutral-700/80 rounded-full text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      <img 
        src={imageUrl} 
        alt="Zoomed image" 
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}

import React from 'react';
import { ICONS } from '../constants';

interface ImageViewerProps {
  src: string;
  onClose: () => void;
  territoryNumber: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose, territoryNumber }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        aria-label="Cerrar"
      >
        {React.cloneElement(ICONS.close, { className: 'h-6 w-6' })}
      </button>
      <img
        src={src}
        alt={`Mapa del territorio ${territoryNumber}`}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-lg  px-4 py-2 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        Territorio {territoryNumber}
      </div>

      
    </div>
  );
};

export default ImageViewer;
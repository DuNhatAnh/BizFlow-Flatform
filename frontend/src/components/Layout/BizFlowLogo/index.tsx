import React from 'react';

export const BizFlowLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 200 170" 
        className="w-full h-auto drop-shadow-sm"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="squareGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2c83d6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        
        {/* Dark Blue Hexagon with Gradient */}
        <path d="M75 20 L135 55 L135 125 L75 160 L15 125 L15 55 Z" fill="url(#hexGradient)" />
        
        {/* 3D Stack Effect for the Square */}
        <rect x="102" y="57" width="85" height="85" rx="14" fill="#93c5fd" opacity="0.6" />
        <rect x="96" y="51" width="85" height="85" rx="14" fill="#60a5fa" opacity="0.8" />
        <rect x="90" y="45" width="85" height="85" rx="14" fill="url(#squareGradient)" stroke="#ffffff" strokeWidth="6" />

        {/* White Swoosh Arrow */}
        <path d="M 25 105
                 Q 70 130 115 80
                 L 107 65
                 L 140 60
                 L 127 93
                 L 120 85
                 Q 70 150 25 105 Z" fill="#ffffff" />
      </svg>
      
      <div className="-mt-1 flex flex-col items-center select-none">
        <span className="text-[1.8rem] tracking-[0.02em] font-black text-[#11287c] font-sans leading-none">BIZFLOW</span>
        <span className="text-[0.75rem] text-[#7d7d7d] font-bold tracking-[0.45em] mt-1 uppercase ml-[0.45em]">PLATFORM</span>
      </div>
    </div>
  );
};

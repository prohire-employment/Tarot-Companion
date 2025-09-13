import React from 'react';

interface CardBackProps {
  className?: string;
  isShimmering?: boolean;
}

const CardBack: React.FC<CardBackProps> = ({ className, isShimmering = false }) => {
  return (
    <div className={`relative w-full aspect-[3/4] bg-surface rounded-card overflow-hidden shadow-md animate-fade-in ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 420"
        className="w-full h-full"
        aria-hidden="true"
      >
        <rect width="300" height="420" fill="url(#card_back_gradient)" />
        <defs>
          <radialGradient id="card_back_gradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: '#2a2833', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1c1b22', stopOpacity: 1 }} />
          </radialGradient>
        </defs>

        {/* Ornate Border */}
        <rect x="10" y="10" width="280" height="400" rx="20" ry="20" fill="none" stroke="#e0c483" strokeWidth="2" strokeOpacity="0.5" />
        <rect x="15" y="15" width="270" height="390" rx="15" ry="15" fill="none" stroke="#e0c483" strokeWidth="1" strokeOpacity="0.3" />

        {/* Central Design */}
        <g transform="translate(150, 210)" className="text-accent">
          {/* Eye of Intuition */}
          <path d="M-60,0 C-20,-40 20,-40 60,0 C20,40 -20,40 -60,0 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="0" cy="0" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="0" cy="0" r="5" fill="currentColor" />

          {/* Crescent Moon */}
          <path d="M-40, -60 A60,60 0 0,1 20,-80 A45,45 0 0,0 -40,-60 Z" fill="currentColor" opacity="0.7" />

          {/* Star */}
          <g transform="translate(50, -65)">
            <path d="M0 -10 L2.939 -4.045 L9.511 -3.09 L4.755 1.545 L6.427 7.608 L0 5 L-6.427 7.608 L-4.755 1.545 L-9.511 -3.09 L-2.939 -4.045 Z" fill="currentColor" />
          </g>

          {/* Decorative Lines */}
          <g opacity="0.4">
            <path d="M-80 0 L-100 0" stroke="currentColor" strokeWidth="1" />
            <path d="M80 0 L100 0" stroke="currentColor" strokeWidth="1" />
            <path d="M-75 30 L-90 45" stroke="currentColor" strokeWidth="1" />
            <path d="M75 30 L90 45" stroke="currentColor" strokeWidth="1" />
            <path d="M-75 -30 L-90 -45" stroke="currentColor" strokeWidth="1" />
            <path d="M75 -30 L90 -45" stroke="currentColor" strokeWidth="1" />
            <circle cx="0" cy="0" r="100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3, 5" />
          </g>
        </g>
      </svg>
      {isShimmering && (
         <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-shimmer-fast"
          style={{ backgroundSize: '200% 100%' }}
        />
      )}
    </div>
  );
};

export default CardBack;
import React from 'react';

const CardSkeleton: React.FC = () => {
  return (
    <div className="text-center space-y-2">
      <div className="relative w-full aspect-[3/4] rounded-lg bg-surface/70 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/50 to-transparent animate-shimmer-fast" style={{ backgroundSize: '200% 100%' }} />
      </div>
      <div className="relative h-4 bg-surface/70 rounded-md w-3/4 mx-auto overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/50 to-transparent animate-shimmer-fast" style={{ backgroundSize: '200% 100%' }} />
      </div>
    </div>
  );
};

export default CardSkeleton;

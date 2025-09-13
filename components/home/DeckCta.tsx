import React from 'react';
import CardBack from '../CardBack';

interface DeckCtaProps {
  onClick: () => void;
}

const DeckCta: React.FC<DeckCtaProps> = ({ onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[230px] md:min-h-0 text-center">
        <div className="font-serif mb-6">
            <h3 className="text-xl font-bold text-text">Deeper Inquiry</h3>
            <p className="text-sub mt-1 max-w-xs mx-auto">Explore a specific question or situation with a multi-card spread.</p>
        </div>
        <button
            onClick={onClick}
            className="relative w-40 h-56 group perspective-1000"
            aria-label="Start a new reading"
        >
            {/* Create a stack of 3 cards */}
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="absolute inset-0 transition-transform duration-500 ease-soft group-hover:rotate-0 group-focus-visible:rotate-0"
                    style={{
                        transform: `translateX(${(i - 1) * 5}px) translateY(${-(i - 1) * 5}px) rotate(${(i - 1) * 4}deg)`,
                    }}
                >
                    <CardBack className="shadow-lg group-hover:shadow-glow" />
                </div>
            ))}
        </button>
    </div>
  );
};

export default DeckCta;

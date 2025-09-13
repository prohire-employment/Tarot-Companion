import React, { useMemo } from 'react';
import type { JournalEntry, Arcana, Suit } from '../../types';
import { SuitIcon } from '../icons/SuitIcons';

interface JourneyVisualizerProps {
  entries: JournalEntry[];
}

type StatData = {
  count: number;
  percentage: number;
};

// Configuration for each satellite orb
const STAT_CONFIG: { 
  key: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'; 
  name: string; 
  color: string; 
  insight: string;
  suit: Suit;
  arcana: Arcana;
}[] = [
  { key: 'major', name: 'Major Arcana', color: 'text-accent', insight: 'Your path has involved significant life lessons and archetypal energies.', suit: 'None', arcana: 'Major' },
  { key: 'wands', name: 'Suit of Wands', color: 'text-orange-400', insight: 'Lately, your journey has been focused on passion, action, and creativity.', suit: 'Wands', arcana: 'Minor' },
  { key: 'cups', name: 'Suit of Cups', color: 'text-blue-400', insight: 'You have been exploring the realms of emotion, relationships, and intuition.', suit: 'Cups', arcana: 'Minor' },
  { key: 'swords', name: 'Suit of Swords', color: 'text-sky-300', insight: 'Your focus has been on thoughts, challenges, and seeking truth.', suit: 'Swords', arcana: 'Minor' },
  { key: 'pentacles', name: 'Suit of Pentacles', color: 'text-emerald-400', insight: 'You have been attending to the material world: career, finances, and health.', suit: 'Pentacles', arcana: 'Minor' },
];

const JourneyVisualizer: React.FC<JourneyVisualizerProps> = ({ entries }) => {
  const { cardStats, totalCardsDrawn } = useMemo(() => {
    const counts: Record<string, number> = {
      major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0,
    };
    let totalCards = 0;
    
    entries.forEach(entry => {
      entry.drawnCards.forEach(({ card }) => {
        totalCards++;
        if (card.arcana === 'Major') {
          counts.major++;
        } else {
          switch (card.suit) {
            case 'Wands': counts.wands++; break;
            case 'Cups': counts.cups++; break;
            case 'Swords': counts.swords++; break;
            case 'Pentacles': counts.pentacles++; break;
          }
        }
      });
    });

    if (totalCards === 0) return { cardStats: null, totalCardsDrawn: 0 };

    const results: Record<string, StatData> = {};
    Object.keys(counts).forEach(key => {
        results[key] = {
            count: counts[key],
            percentage: totalCards > 0 ? counts[key] / totalCards : 0,
        };
    });
    return { cardStats: results, totalCardsDrawn: totalCards };

  }, [entries]);

  if (!cardStats) return null;

  const totalReadings = entries.length;
  const R = 80; // Orbit radius
  const N = STAT_CONFIG.length;
  const angleStep = (2 * Math.PI) / N;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
        <div className="w-full md:w-1/2 max-w-[250px] mx-auto aspect-square flex-shrink-0">
            <svg viewBox="0 0 200 200" aria-labelledby="visualizer-title" role="img">
                <title id="visualizer-title">A generative artwork representing the elemental balance of your tarot readings.</title>
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Center Orb */}
                <circle cx="100" cy="100" r="20" className="fill-surface stroke-border" />
                <circle cx="100" cy="100" r="15" className="fill-accent/30 animate-pulse-soft" />

                {/* Orbits */}
                <g className="opacity-20">
                    <circle cx="100" cy="100" r={R} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="3 3"/>
                </g>

                {/* Satellites */}
                <g>
                {STAT_CONFIG.map(({ key, name, color, insight }, index) => {
                    const data = cardStats[key];
                    if (!data || data.count === 0) return null;
                    
                    const angle = angleStep * index - (Math.PI / 2); // Start from top
                    const cx = 100 + R * Math.cos(angle);
                    const cy = 100 + R * Math.sin(angle);
                    const r = 5 + data.percentage * 25; // min 5, max 30
                    const opacity = 0.5 + data.percentage * 0.5; // min 0.5, max 1.0
                    
                    return (
                    <g 
                        key={key} 
                        className={`${color} transition-all duration-500 hover:opacity-100 cursor-pointer group`}
                        style={{ opacity: opacity }}
                        filter="url(#glow)"
                    >
                        <title>{`${name} (${(data.percentage * 100).toFixed(0)}%): ${insight}`}</title>
                        <circle cx={cx} cy={cy} r={r} fill="currentColor" className="transition-transform duration-300 ease-soft group-hover:scale-110" />
                    </g>
                    );
                })}
                </g>
            </svg>
        </div>
        <div className="w-full md:w-1/2 text-left font-sans flex-grow">
            <h4 className="font-bold text-accent mb-3 text-center md:text-left">Your Journey by the Numbers</h4>
            <div className="text-sm space-y-2 bg-bg/40 p-4 rounded-lg border border-border/50">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-sub">Total Readings</span>
                    <span className="font-bold text-text text-base">{totalReadings}</span>
                </div>
                 <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-medium text-sub">Total Cards Drawn</span>
                    <span className="font-bold text-text text-base">{totalCardsDrawn}</span>
                </div>
                {STAT_CONFIG.map(({ key, name, color, arcana, suit }) => {
                    const stat = cardStats[key];
                    if (!stat) return null;
                    return (
                        <div key={key} className="flex justify-between items-center">
                            <span className={`flex items-center gap-2 font-medium ${color}`}>
                                <SuitIcon arcana={arcana} suit={suit} className="w-4 h-4" />
                                <span>{name}</span>
                            </span>
                            <span className="font-bold text-text">
                                {stat.count} <span className="text-sub text-xs font-normal">({(stat.percentage * 100).toFixed(0)}%)</span>
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
};

export default JourneyVisualizer;
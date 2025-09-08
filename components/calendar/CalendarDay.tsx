import React from 'react';
import { LunarPhaseIcon, SabbatIcon } from '../icons/AlmanacIcons';

interface Cell {
  day: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  dateStr?: string;
  hasReading?: boolean;
  holiday?: string | null;
  phase?: string;
}

interface CalendarDayProps {
  cell: Cell;
  onDayClick: (dateStr: string) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ cell, onDayClick }) => {
  const commonClasses = "relative aspect-square p-1.5 border border-transparent rounded-lg flex flex-col justify-between";
  const dayNumberClass = `text-sm ${cell.isToday ? 'bg-accent text-accent-dark rounded-full w-6 h-6 flex items-center justify-center font-bold' : 'w-6 h-6 flex items-center justify-center'}`;

  if (!cell.isCurrentMonth) {
    return (
      <div className={`${commonClasses} text-sub/30`}>
        <span className="w-6 h-6 flex items-center justify-center text-sm">{cell.day}</span>
      </div>
    );
  }

  const handleClick = () => {
    if (cell.dateStr) onDayClick(cell.dateStr);
  };

  const buttonClasses = `${commonClasses} text-text transition-colors duration-200 ${cell.isToday ? 'border-accent' : ''} ${cell.hasReading ? 'bg-bg/60 hover:bg-border/70 cursor-pointer' : 'bg-bg/40'}`;

  return (
    <button
      onClick={handleClick}
      disabled={!cell.hasReading}
      className={buttonClasses}
      aria-label={`View readings for ${cell.dateStr}`}
    >
      <div className="flex justify-between items-start w-full">
        <span className={dayNumberClass}>
          {cell.day}
        </span>
        {cell.phase && (
          <LunarPhaseIcon phase={cell.phase} className="w-4 h-4 text-sub/80" />
        )}
      </div>
      
      <div className="flex justify-center items-center gap-1.5 h-4">
        {cell.hasReading && (
          <div className="w-2 h-2 bg-accent rounded-full" title="Reading saved"></div>
        )}
        
        {cell.holiday && (
          <SabbatIcon className="w-4 h-4 text-purple-400" title={cell.holiday} />
        )}
      </div>
    </button>
  );
};

export default React.memo(CalendarDay);

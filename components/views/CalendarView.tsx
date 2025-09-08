import React, { useState, useMemo } from 'react';
import { useAlmanac } from '../../hooks/useAlmanac';
import { getWheelHoliday, getLunarPhase } from '../../lib/almanac';
import { useJournalStore } from '../../store/journalStore';
import { LunarPhaseIcon, SabbatIcon } from '../icons/AlmanacIcons';

const CalendarView: React.FC = () => {
  const almanac = useAlmanac();
  const { entries } = useJournalStore();
  const [viewDate, setViewDate] = useState(new Date());

  const readingDates = useMemo(() => new Set(entries.map(e => e.dateISO)), [entries]);
  
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...

    const grid: any[] = [];
    
    // Previous month's padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({
        day: prevMonthLastDay - startDayOfWeek + i + 1,
        isCurrentMonth: false,
      });
    }

    // Current month's days
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().slice(0, 10);
      grid.push({
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        dateStr: dateStr,
        hasReading: readingDates.has(dateStr),
        holiday: getWheelHoliday(date),
        phase: getLunarPhase(date),
      });
    }

    // Next month's padding
    const gridLength = grid.length;
    for (let i = 1; i <= (42 - gridLength); i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
      });
    }
    
    return grid;

  }, [viewDate, readingDates]);

  const changeMonth = (delta: number) => {
    setViewDate(current => {
      const newDate = new Date(current);
      newDate.setDate(1); // Avoid issues with months of different lengths
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 font-serif">
      <h2 className="text-3xl font-bold text-accent text-center">Calendar</h2>
      
      <section className="bg-surface rounded-card shadow-main p-6 card-border">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Previous month">&lt;</button>
          <h3 className="text-xl font-bold text-text">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Next month">&gt;</button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center font-sans">
          {weekdays.map(day => <div key={day} className="text-sub font-bold text-sm h-8 flex items-center justify-center" aria-hidden="true">{day}</div>)}
          
          {calendarGrid.map((cell, index) => (
            <div
              key={index}
              className={`relative aspect-square min-h-[5rem] p-1.5 border border-transparent rounded-lg flex flex-col justify-between ${
                !cell.isCurrentMonth ? 'text-sub/30' : 'bg-bg/40 hover:bg-border/50 transition-colors duration-200'
              } ${cell.isToday ? 'border-accent' : ''}`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-sm ${cell.isToday ? 'bg-accent text-accent-dark rounded-full w-6 h-6 flex items-center justify-center font-bold' : 'w-6 h-6 flex items-center justify-center'}`}>
                  {cell.day}
                </span>
                {cell.isCurrentMonth && cell.phase && (
                  <LunarPhaseIcon phase={cell.phase} className="w-5 h-5 text-sub" />
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
            </div>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-4 mt-4 font-sans text-xs text-sub">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-accent rounded-full"></div> Reading Day</div>
            <div className="flex items-center gap-2"><SabbatIcon className="w-3 h-3 text-purple-400" /> Sabbat</div>
        </div>
      </section>

      <section className="bg-surface rounded-card shadow-main p-6 text-center card-border">
        <h3 className="text-xl font-bold text-accent mb-2">Today's Almanac</h3>
        <p className="text-lg text-sub">{new Date().toDateString()}</p>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <h4 className="font-bold text-accent/80">Lunar Phase</h4>
            <p className="text-lg text-text">{almanac.lunarPhase}</p>
          </div>
          <div>
            <h4 className="font-bold text-accent/80">Season</h4>
            <p className="text-lg text-text">{almanac.season}</p>
          </div>
          <div>
            <h4 className="font-bold text-accent/80">Sabbat</h4>
            <p className="text-lg text-text">{almanac.holiday || '—'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalendarView;
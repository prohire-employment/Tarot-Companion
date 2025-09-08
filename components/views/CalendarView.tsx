import React, { useState, useMemo, useCallback } from 'react';
import { useAlmanac } from '../../hooks/useAlmanac';
import { getWheelHoliday, getLunarPhase } from '../../lib/almanac';
import { useJournalStore } from '../../store/journalStore';
import type { JournalEntry } from '../../types';
import { SabbatIcon } from '../icons/AlmanacIcons';
import CalendarDay from '../calendar/CalendarDay';
import CalendarDayModal from '../calendar/CalendarDayModal';
import { getLocalISO_Date } from '../../lib/utils';

const CalendarView: React.FC = () => {
  const almanac = useAlmanac();
  const { entries } = useJournalStore();
  const [viewDate, setViewDate] = useState(new Date());

  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[]>([]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      const dateEntries = map.get(entry.dateISO) || [];
      map.set(entry.dateISO, [...dateEntries, entry]);
    }
    return map;
  }, [entries]);

  const handleDayClick = useCallback((dateStr: string) => {
    const entriesForDay = entriesByDate.get(dateStr);
    if (entriesForDay && entriesForDay.length > 0) {
      setSelectedDayEntries(entriesForDay);
      setIsDayModalOpen(true);
    }
  }, [entriesByDate]);
  
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const grid = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({
        day: prevMonthLastDay - startDayOfWeek + i + 1,
        isCurrentMonth: false,
      });
    }

    const todayStr = getLocalISO_Date(new Date());
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = getLocalISO_Date(date);
      grid.push({
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        dateStr: dateStr,
        hasReading: entriesByDate.has(dateStr),
        holiday: getWheelHoliday(date),
        phase: getLunarPhase(date),
      });
    }

    const gridLength = grid.length;
    for (let i = 1; i <= (42 - gridLength); i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
      });
    }
    
    return grid;

  }, [viewDate, entriesByDate]);

  const changeMonth = (delta: number) => {
    setViewDate(current => {
      const newDate = new Date(current);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
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
              <CalendarDay key={`${viewDate.getMonth()}-${index}`} cell={cell} onDayClick={handleDayClick} />
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

      <CalendarDayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        entries={selectedDayEntries}
      />
    </>
  );
};

export default CalendarView;
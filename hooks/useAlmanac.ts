import { useState, useEffect } from 'react';
import { getLunarPhase, getSeason, getWheelHoliday, getUpcomingHolidays } from '../lib/almanac';
import type { AlmanacInfo } from '../types';

export const useAlmanac = (): AlmanacInfo => {
  const [almanacInfo, setAlmanacInfo] = useState<AlmanacInfo>(() => {
    const now = new Date();
    return {
      lunarPhase: getLunarPhase(now),
      season: getSeason(now),
      holiday: getWheelHoliday(now),
      upcomingHolidays: getUpcomingHolidays(4),
    };
  });

  useEffect(() => {
    let timeoutId: number;

    const scheduleNextUpdate = () => {
      const now = new Date();
      // Set target to 5 seconds past midnight of the next day to ensure the date has changed.
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0); 
      const msUntilTomorrow = tomorrow.getTime() - now.getTime();

      timeoutId = window.setTimeout(() => {
        const today = new Date();
        setAlmanacInfo({
          lunarPhase: getLunarPhase(today),
          season: getSeason(today),
          holiday: getWheelHoliday(today),
          upcomingHolidays: getUpcomingHolidays(4),
        });
        // Schedule the next update recursively
        scheduleNextUpdate();
      }, msUntilTomorrow);
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array ensures this runs only once on mount.

  return almanacInfo;
};
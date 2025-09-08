
import { useState, useEffect } from 'react';
import { getLunarPhase, getSeason, getWheelHoliday } from '../lib/almanac';
import type { AlmanacInfo } from '../types';

export const useAlmanac = (): AlmanacInfo => {
  const [almanacInfo, setAlmanacInfo] = useState<AlmanacInfo>(() => {
    const now = new Date();
    return {
      lunarPhase: getLunarPhase(now),
      season: getSeason(now),
      holiday: getWheelHoliday(now),
    };
  });

  useEffect(() => {
    const oneDay = 1000 * 60 * 60 * 24;
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      const today = new Date();
      setAlmanacInfo({
        lunarPhase: getLunarPhase(today),
        season: getSeason(today),
        holiday: getWheelHoliday(today),
      });
      // After the first timeout, set an interval for every 24 hours
      const intervalId = setInterval(() => {
        const today = new Date();
        setAlmanacInfo({
          lunarPhase: getLunarPhase(today),
          season: getSeason(today),
          holiday: getWheelHoliday(today),
        });
      }, oneDay);
      return () => clearInterval(intervalId);
    }, msUntilTomorrow);

    return () => clearTimeout(timeoutId);
  }, []);

  return almanacInfo;
};

interface Sabbat {
  name: string;
  month: number; // 0-11
  day: number;
}

const SABBATS: Sabbat[] = [
  { name: 'Imbolc', month: 1, day: 1 },
  { name: 'Ostara', month: 2, day: 20 },
  { name: 'Beltane', month: 4, day: 1 },
  { name: 'Litha', month: 5, day: 21 },
  { name: 'Lughnasadh', month: 7, day: 1 },
  { name: 'Mabon', month: 8, day: 22 },
  { name: 'Samhain', month: 9, day: 31 },
  { name: 'Yule', month: 11, day: 21 },
];

export function getLunarPhase(date: Date = new Date()): string {
  const synodic = 29.530588; // days
  const knownNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const days = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((days % synodic) + synodic) % synodic;
  if (phase < 1.845) return 'New Moon';
  if (phase < 5.536) return 'Waxing Crescent';
  if (phase < 9.228) return 'First Quarter';
  if (phase < 12.919) return 'Waxing Gibbous';
  if (phase < 16.611) return 'Full Moon';
  if (phase < 20.302) return 'Waning Gibbous';
  if (phase < 23.994) return 'Last Quarter';
  if (phase < 27.684) return 'Waning Crescent';
  return 'New Moon';
}

export function getSeason(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-11
  return ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'][month];
}

export function getWheelHoliday(date: Date = new Date()): string | null {
  const month = date.getMonth();
  const day = date.getDate();
  
  const holiday = SABBATS.find(s => s.month === month && s.day === day);
  
  return holiday ? holiday.name : null;
}

export function getUpcomingHolidays(count: number = 4): { name: string; date: Date }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Normalize to start of day
  const currentYear = today.getFullYear();

  const holidaysThisYear = SABBATS.map(sabbat => ({
    name: sabbat.name,
    date: new Date(currentYear, sabbat.month, sabbat.day),
  }));

  const holidaysNextYear = SABBATS.map(sabbat => ({
    name: sabbat.name,
    date: new Date(currentYear + 1, sabbat.month, sabbat.day),
  }));

  const allPossibleHolidays = [...holidaysThisYear, ...holidaysNextYear];

  const upcoming = allPossibleHolidays
    .filter(holiday => holiday.date >= today)
    .slice(0, count);
    
  return upcoming;
}
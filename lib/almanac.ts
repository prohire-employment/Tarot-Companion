
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
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const md = (m: number, d: number) => (month === m && day === d);
  
  // Approximate dates for Sabbats
  if (md(1, 1)) return 'Imbolc';
  if (md(2, 20)) return 'Ostara';
  if (md(4, 1)) return 'Beltane';
  if (md(5, 21)) return 'Litha';
  if (md(7, 1)) return 'Lughnasadh';
  if (md(8, 22)) return 'Mabon';
  if (md(9, 31)) return 'Samhain';
  if (md(11, 21)) return 'Yule';
  
  return null;
}

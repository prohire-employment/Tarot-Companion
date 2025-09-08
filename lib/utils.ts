// Fisher-Yates (aka Knuth) Shuffle.
// This algorithm is proven to be unbiased, unlike the common `sort(() => 0.5 - Math.random())`.
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex],
    ];
  }

  return newArray;
}

/**
 * Returns a date formatted as 'YYYY-MM-DD' in the user's local timezone.
 * This avoids the timezone issues inherent in using `toISOString().slice(0, 10)`.
 * @param date The date to format. Defaults to the current date.
 * @returns The formatted date string.
 */
export function getLocalISO_Date(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
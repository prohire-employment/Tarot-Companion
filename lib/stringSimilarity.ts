// A simple implementation of the Levenshtein distance algorithm to find similarity between two strings.
// This is useful for fuzzy matching, like comparing speech-to-text output with known card names.

export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

export function findBestMatch<T extends { name: string }>(
  query: string,
  items: T[],
  threshold: number = 0.6
): T | null {
  if (!query || items.length === 0) return null;
  const lowerQuery = query.toLowerCase();
  
  let bestMatch: T | null = null;
  let highestSimilarity = -1;

  for (const item of items) {
    const itemNameLower = item.name.toLowerCase();
    const distance = levenshteinDistance(lowerQuery, itemNameLower);
    
    // Normalize distance to a similarity score (0-1)
    const maxLength = Math.max(lowerQuery.length, itemNameLower.length);
    const similarity = maxLength === 0 ? 1 : 1 - distance / maxLength;

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = item;
    }
  }
  
  return highestSimilarity >= threshold ? bestMatch : null;
}
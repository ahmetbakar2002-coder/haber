export function calculateSourcePriority(sourceName: string, sourceUrl: string): number {
  const normalizedName = sourceName.toLowerCase();
  
  const priorityMap: Record<string, number> = {
    'reuters': 100,
    'ap': 100,
    'associated press': 100,
    'bbc': 95,
    'espn': 95,
    'sky sports': 90,
    'uefa': 100,
    'fifa': 100,
    'fiba': 100,
  };

  for (const [key, score] of Object.entries(priorityMap)) {
    if (normalizedName.includes(key)) {
      return score;
    }
  }

  // Check if it's an official club site (rough heuristic)
  if (sourceUrl.includes('fc') || sourceUrl.includes('club') || sourceUrl.includes('official')) {
    return 100;
  }

  // Social media
  if (sourceUrl.includes('twitter.com') || sourceUrl.includes('x.com')) {
    return 50;
  }

  return 50; // default trust score
}

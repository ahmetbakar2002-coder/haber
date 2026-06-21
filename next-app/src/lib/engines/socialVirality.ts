export function calculateSocialVirality(title: string, content: string, sourcePriority: number): number {
  let score = 0;
  const text = `${title} ${content}`.toLowerCase();
  
  // Basic heuristics for virality
  const viralKeywords = [
    'inanılmaz', 'şok', 'rekor', 'skandal', 'olay', 'kavga', 'istifa', 'kırmızı kart', 'derbi'
  ];
  
  for (const keyword of viralKeywords) {
    if (text.includes(keyword)) score += 15;
  }
  
  // Higher source priority boosts virality baseline
  if (sourcePriority > 80) score += 20;
  
  // Cap at 100
  return Math.min(100, score);
}

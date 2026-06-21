// In a real application, trend score might be calculated based on Google Analytics, 
// Redis view counters, or social media shares.
// We mock the score calculation here.

export function calculateTrendScore(views: number, shares: number, ageInHours: number): number {
  if (ageInHours > 24) return 0; // Only trending if newer than 24h
  
  // Simple algorithm: more views/shares and less age = higher score
  const score = (views * 1) + (shares * 5) - (ageInHours * 10);
  
  return Math.max(0, score);
}

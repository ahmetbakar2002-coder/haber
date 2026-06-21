export function calculateTransferConfidence(title: string, content: string, sourceName: string): number | null {
  const text = `${title} ${content}`.toLowerCase();
  
  // If it's not a transfer news, return null
  if (!text.includes('transfer') && !text.includes('imza') && !text.includes('anlaştı')) {
    return null;
  }

  const normalizedSource = sourceName.toLowerCase();
  
  if (normalizedSource.includes('official') || normalizedSource.includes('kulübü')) return 100;
  if (text.includes('here we go') || normalizedSource.includes('fabrizio romano')) return 95;
  if (normalizedSource.includes('reuters') || normalizedSource.includes('ap')) return 90;
  if (normalizedSource.includes('espn') || normalizedSource.includes('bbc')) return 85;
  
  // Local press
  if (normalizedSource.includes('spor') || normalizedSource.includes('ajans')) return 60;
  
  // Social media rumors
  if (normalizedSource.includes('twitter') || normalizedSource.includes('x.com')) return 20;

  return 40; // Default rumor
}

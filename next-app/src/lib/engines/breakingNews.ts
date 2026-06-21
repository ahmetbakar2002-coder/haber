export function isBreakingNews(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  
  const breakingKeywords = [
    'resmi açıklama', 'transfer oldu', 'imza attı', 
    'teknik direktör', 'ayrıldı', 'görevden alındı', 'istifa',
    'şampiyon', 'kupa', 'madalya',
    'çapraz bağ', 'sezonu kapattı', 'ameliyat',
    'dünya rekoru', 'olimpiyat rekoru'
  ];

  for (const keyword of breakingKeywords) {
    if (text.includes(keyword)) {
      return true;
    }
  }

  return false;
}

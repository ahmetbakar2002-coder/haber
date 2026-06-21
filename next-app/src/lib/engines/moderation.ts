export interface ModerationResult {
  passed: boolean;
  reason?: string;
}

export function moderateArticle(title: string, content: string, sourceUrl?: string): ModerationResult {
  if (!title || title.trim() === '') {
    return { passed: false, reason: "Başlık boş." };
  }

  if (!content || content.trim().length < 100) {
    return { passed: false, reason: "İçerik çok kısa (100 karakterden az)." };
  }

  if (!sourceUrl || sourceUrl.trim() === '') {
    return { passed: false, reason: "Haberin kaynağı (URL) eksik." };
  }

  const badWords = ['küfür1', 'küfür2', 'illegal_kelime'];
  const textToCheck = `${title} ${content}`.toLowerCase();
  
  for (const word of badWords) {
    if (textToCheck.includes(word)) {
      return { passed: false, reason: "Uygunsuz kelime tespit edildi." };
    }
  }

  return { passed: true };
}

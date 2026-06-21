import { Article } from '@prisma/client';

const FORUM_API_URL = process.env.FORUM_API_URL || 'http://localhost:3000/api/webhook/news';
const CRON_SECRET = process.env.CRON_SECRET || 'cakuspor-cron-2026';

export async function publishToForum(article: Article, categorySlug: string) {
  let channelName = 'spor-haberleri';
  
  const textToScan = `${article.title} ${article.content} ${categorySlug}`.toLowerCase();

  // E-spor kontrolü (Kaynak kategorisi VEYA metin içindeki kelimeler)
  const esporKategorileri = ['cs2', 'valorant', 'lol', 'mlbb', 'clash royale'];
  const esporKeywords = ['espor', 'e-spor', 'esports', 'cs:go', 'cs2', 'valorant', 'league of legends', 'lol', 'dota', 'hltv', 'fut esports', 'bbl', 'papara supermassive'];
  const isEspor = esporKategorileri.includes(categorySlug.toLowerCase()) || esporKeywords.some(kw => textToScan.includes(kw));

  // Dünya Spor kontrolü (Kaynak kategorisi VEYA metin içindeki kelimeler)
  const dunyaKategorileri = ['motor sporları', 'tenis', 'atletizm', 'dövüş sporları'];
  const dunyaKeywords = ['dünya', 'dunya', 'avrupa', 'şampiyonlar ligi', 'euroleague', 'formula 1', 'f1', 'wimbledon', 'roland garros', 'nba', 'premier lig', 'elmas lig', 'diamond league', 'olimpiyat'];
  const isDunya = dunyaKategorileri.includes(categorySlug.toLowerCase()) || dunyaKeywords.some(kw => textToScan.includes(kw));

  if (isEspor) {
    channelName = 'espor-haberleri';
  } else if (isDunya && !article.isMilliHaber) {
    channelName = 'dunya-spor';
  }

  // Forum için Markdown formatında mesaj oluştur
  const lines = [
    `📰 **${article.title}**`,
    '',
    article.summaryMedium || article.summaryShort || article.summary || '',
    '',
    `🏷️ *Kategori: ${categorySlug.toUpperCase()}*`
  ];

  const content = lines.join('\n').trim();

  try {
    const response = await fetch(FORUM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelName,
        content,
        secret: CRON_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ForumIntegration] Failed to post to forum:', errorText);
      return false;
    }
    
    console.log(`[ForumIntegration] Haber '${channelName}' kanalına başarıyla gönderildi.`);
    return true;
  } catch (error) {
    console.error('[ForumIntegration] Exception during POST:', error);
    return false;
  }
}

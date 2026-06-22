import { Article } from '@prisma/client';

const FORUM_API_URL = process.env.FORUM_API_URL || 'http://localhost:3000/api/webhook/news';
const CRON_SECRET = process.env.CRON_SECRET || 'cakuspor-cron-2026';

export async function publishToForum(article: Article, categorySlug: string) {
  // Kategori slug'ını forum kanallarıyla eşleştir (Varsayılan: spor-haberleri)
  let channelName = 'spor-haberleri';
  
  if (categorySlug === 'dunya' || categorySlug === 'avrupa' || categorySlug === 'ingiltere') {
    channelName = 'dunya-spor';
  } else if (categorySlug === 'espor' || categorySlug === 'e-spor') {
    channelName = 'espor-haberleri';
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

import { Article } from '@prisma/client';

const FORUM_API_URL = process.env.FORUM_API_URL || 'http://localhost:3000/api/webhook/news';
const CRON_SECRET = process.env.CRON_SECRET || 'cakuspor-cron-2026';

export async function publishToForum(article: Article, categorySlug: string) {
  let channelName = 'spor-haberleri'; // default
  const textToScan = `${article.title} ${article.content} ${categorySlug}`.toLowerCase();

  const containsAny = (text: string, keywords: string[]) => keywords.some(kw => text.includes(kw.toLowerCase()));

  // --- 1. ESPOR KANALI ---
  const esporAccepted = [
    'cs2', 'counter-strike', 'valorant', 'league of legends', 'lol esports', 'dota 2', 'mobile legends', 'mlbb', 
    'pubg mobile esports', 'rainbow six siege', 'apex legends', 'fortnite competitive', 'rocket league esports', 
    'overwatch esports', 'vct', 'lec', 'lck', 'lpl', 'msi', 'worlds', 'iem', 'esl', 'blast', 'dreamleague', 
    'riyadh masters', 'esports world cup', 'mpl', 'm series', 'team liquid', 't1', 'gen.g', 'navi', 'g2 esports', 
    'team spirit', 'eternal fire', 'fut esports', 'bbl esports', 'papara supermassive', 'aurora gaming', 'fnatic', 
    'vitality', 'faze clan', 'team falcons', 'cloud9', 'drx', 'rrq', 'onic', 'geek fam', 'selangor red giants', 
    'blacklist international', 'evos', 'team flash', 'bigetron', 'espor', 'e-spor', 'esports'
  ];
  const esporBanned = [
    'futbol', 'soccer', 'football', 'basketbol', 'basketball', 'voleybol', 'volleyball', 'tenis', 'tennis', 
    'formula 1', 'motogp', 'olimpiyat', 'olympics', 'atletizm', 'yüzme', 'transfermarkt', 'fifa kulüpler dünya kupası', 
    'süper lig', 'tff', 'galatasaray', 'fenerbahçe', 'beşiktaş', 'trabzonspor'
  ];

  // --- 2. DÜNYA SPORU KANALI ---
  const dunyaAccepted = [
    'premier league', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'champions league', 'uefa', 'fifa', 
    'club world cup', 'copa america', 'conmebol', 'afc', 'mls', 'nba', 'euroleague', 'fiba', 'ncaa', 
    'formula 1', 'motogp', 'ufc', 'atp', 'wta', 'wimbledon', 'roland garros', 'australian open', 'us open', 
    'tour de france', 'nhl', 'nfl', 'mlb', 'dünya', 'dunya', 'avrupa', 'diamond league'
  ];
  const dunyaBanned = [
    'süper lig', 'tff', 'türkiye kupası', '1. lig', 'tff 2. lig', 'tff 3. lig', 'bölgesel amatör lig', 
    'çaykur rizespor', 'gençlerbirliği', 'ankaragücü', 'konyaspor', 'kayserispor', 'samsunspor', 'adana demirspor', 
    'göztepe', 'gaziantep fk', 'eyüpspor', 'türk milli takımı', 'a milli takım', 'u21 türkiye', 'türkiye voleybol federasyonu'
  ];

  // --- 3. TÜRKİYE SPORU KANALI (spor-haberleri) ---
  const turkiyeAccepted = [
    'süper lig', 'tff', 'türkiye kupası', 'galatasaray', 'fenerbahçe', 'beşiktaş', 'trabzonspor', 'başakşehir', 
    'samsunspor', 'kasımpaşa', 'eyüpspor', 'gençlerbirliği', 'ankaragücü', 'basketbol süper ligi', 
    'türkiye basketbol federasyonu', 'anadolu efes', 'fenerbahçe beko', 'beşiktaş fibabanka', 'galatasaray basketbol', 
    'sultanlar ligi', 'efeler ligi', 'vakıfbank', 'eczacıbaşı', 'fenerbahçe medicana', 'a milli futbol takımı', 
    'türkiye milli takımı', 'filenin sultanları'
  ];
  const turkiyeBanned = [
    'counter-strike', 'cs2', 'valorant', 'league of legends', 'dota 2', 'mobile legends', 'mlbb', 'vct', 
    'lec', 'lck', 'esl', 'blast', 'iem', 'team liquid', 't1', 'navi', 'g2 esports', 'team spirit', 'espor', 'e-spor'
  ];

  // Mantıksal Filtreleme
  const isEspor = containsAny(textToScan, esporAccepted) && !containsAny(textToScan, esporBanned);
  const isDunya = containsAny(textToScan, dunyaAccepted) && !containsAny(textToScan, dunyaBanned);
  const isTurkiye = containsAny(textToScan, turkiyeAccepted) && !containsAny(textToScan, turkiyeBanned);

  // Karar Ağacı
  if (isEspor) {
    channelName = 'espor-haberleri';
  } else if (isTurkiye) {
    channelName = 'spor-haberleri';
  } else if (isDunya) {
    channelName = 'dunya-spor';
  } else {
    // Hiçbirine tam uymuyorsa, eğer içinde milli takım/türk kelimeleri varsa Türkiye, yoksa Dünya veya Türkiye fallback
    if (article.isMilliHaber || containsAny(textToScan, ['türkiye', 'türk'])) {
      channelName = 'spor-haberleri';
    } else {
      channelName = 'dunya-spor'; // Genel bir spor haberi espor veya TR değilse Dünya sporudur
    }
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

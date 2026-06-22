import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function shareToTelegram(title: string, summary: string, url: string, isBreaking: boolean = false) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const prefix = isBreaking ? '🚨 SON DAKİKA 🚨\n\n' : '';
  const message = `${prefix}**${title}**\n\n${summary}\n\nDetaylar: ${url}`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Telegram Bot Error:', error);
  }
}

export async function shareToDiscord(title: string, summary: string, url: string, isBreaking: boolean = false, imageUrl?: string) {
  if (!DISCORD_WEBHOOK_URL) return;

  const color = isBreaking ? 16711680 : 3447003; // Red for breaking, Blue default

  const embed = {
    title: title,
    description: summary,
    url: url,
    color: color,
    image: imageUrl ? { url: imageUrl } : undefined,
    footer: { text: 'ÇAKÜ Spor Haber Merkezi' }
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      embeds: [embed]
    });
  } catch (error) {
    console.error('Discord Webhook Error:', error);
  }
}

// Orchestrator
export async function autoShareSocials(article: any) {
  const url = `https://cakuspor.com/haber/${article.slug}`;
  const shouldShare = article.isBreaking || article.isMilliHaber || article.title.toLowerCase().includes('transfer');
  
  if (shouldShare) {
    await shareToTelegram(article.title, article.summaryShort || '', url, article.isBreaking);
    await shareToDiscord(article.title, article.summaryShort || '', url, article.isBreaking, article.imageUrl);
  }
}

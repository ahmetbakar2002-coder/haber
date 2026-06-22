export type UpdateFrequency = '1m' | '5m' | '15m' | '60m' | '24h';
export type SourceType = 'RSS' | 'API' | 'WEB';

export interface NewsSource {
  id: string;
  name: string;
  category: string;
  type: SourceType;
  priorityScore: number;
  updateFrequency: UpdateFrequency;
  url: string;
}

export const SOURCES: NewsSource[] = [
  // Futbol
  { id: 'src_f1', name: 'Reuters Sports', category: 'Futbol', type: 'RSS', priorityScore: 100, updateFrequency: '5m', url: 'https://feeds.reuters.com/reuters/sportsNews' },
  { id: 'src_f2', name: 'UEFA Official', category: 'Futbol', type: 'API', priorityScore: 100, updateFrequency: '1m', url: 'https://api.uefa.com/v1/news' },
  { id: 'src_f3', name: 'Fabrizio Romano', category: 'Futbol', type: 'WEB', priorityScore: 95, updateFrequency: '1m', url: 'https://x.com/fabrizioromano' }, // Requires Twitter scraper/API
  { id: 'src_f4', name: 'Galatasaray SK', category: 'Futbol', type: 'RSS', priorityScore: 100, updateFrequency: '15m', url: 'https://www.galatasaray.org/rss' },
  
  // Basketbol
  { id: 'src_b1', name: 'NBA Official', category: 'Basketbol', type: 'API', priorityScore: 100, updateFrequency: '5m', url: 'https://api.nba.net/news' },
  { id: 'src_b2', name: 'EuroLeague', category: 'Basketbol', type: 'RSS', priorityScore: 100, updateFrequency: '15m', url: 'https://www.euroleaguebasketball.net/rss' },
  { id: 'src_b3', name: 'ESPN Basketball', category: 'Basketbol', type: 'RSS', priorityScore: 90, updateFrequency: '5m', url: 'https://www.espn.com/espn/rss/nba/news' },
  
  // Voleybol
  { id: 'src_v1', name: 'FIVB', category: 'Voleybol', type: 'RSS', priorityScore: 100, updateFrequency: '60m', url: 'https://www.fivb.com/rss' },
  { id: 'src_v2', name: 'TVF (Türkiye)', category: 'Voleybol', type: 'WEB', priorityScore: 100, updateFrequency: '15m', url: 'https://tvf.org.tr/haberler' },

  // Tenis
  { id: 'src_t1', name: 'ATP Tour', category: 'Tenis', type: 'RSS', priorityScore: 100, updateFrequency: '15m', url: 'https://www.atptour.com/rss' },
  { id: 'src_t2', name: 'WTA Tour', category: 'Tenis', type: 'RSS', priorityScore: 100, updateFrequency: '15m', url: 'https://www.wtatennis.com/rss' },

  // Motor Sporları
  { id: 'src_m1', name: 'Formula 1', category: 'Motor Sporları', type: 'RSS', priorityScore: 100, updateFrequency: '15m', url: 'https://www.formula1.com/rss' },
  { id: 'src_m2', name: 'Motorsport.com', category: 'Motor Sporları', type: 'RSS', priorityScore: 90, updateFrequency: '5m', url: 'https://tr.motorsport.com/rss' },

  // Dövüş Sporları
  { id: 'src_d1', name: 'UFC Official', category: 'Dövüş Sporları', type: 'API', priorityScore: 100, updateFrequency: '60m', url: 'https://api.ufc.com/news' },

  // Atletizm
  { id: 'src_a1', name: 'World Athletics', category: 'Atletizm', type: 'RSS', priorityScore: 100, updateFrequency: '60m', url: 'https://worldathletics.org/rss' },

  // Espor (CS2, Valorant, LoL, MLBB, Clash Royale)
  { id: 'src_e1', name: 'HLTV', category: 'CS2', type: 'RSS', priorityScore: 100, updateFrequency: '5m', url: 'https://www.hltv.org/rss/news' },
  { id: 'src_e2', name: 'VLR.gg', category: 'Valorant', type: 'RSS', priorityScore: 100, updateFrequency: '5m', url: 'https://www.vlr.gg/rss' },
  { id: 'src_e3', name: 'LoL Esports', category: 'LoL', type: 'API', priorityScore: 100, updateFrequency: '15m', url: 'https://lolesports.com/api/news' },
  { id: 'src_e4', name: 'MLBB Esports', category: 'MLBB', type: 'WEB', priorityScore: 90, updateFrequency: '60m', url: 'https://play.mobilelegends.com/esports/' },
  { id: 'src_e5', name: 'Esports.net CR', category: 'Clash Royale', type: 'RSS', priorityScore: 80, updateFrequency: '60m', url: 'https://www.esports.net/news/clash-royale/feed/' },
];

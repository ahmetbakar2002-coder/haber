import { translate } from '@vitalets/google-translate-api';
import keywordExtractor from 'keyword-extractor';
import nlp from 'compromise';

export interface SuperPayload {
  rewrittenTitle: string;
  rewrittenContent: string;
  summaries: {
    summaryShort: string;
    summaryMedium: string;
    summaryLong: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    tags: string[];
  };
  isMilliHaber: boolean;
  pushNotification: {
    notificationTitle: string;
    notificationBody: string;
  } | null;
  entities: Array<{ name: string; type: string; attributes?: any }>;
  timelineEvent: { topic: string; description: string } | null;
}

const MILLI_KEYWORDS = [
  'türkiye', 'milli takım', 'türk', 'fenerbahçe', 'galatasaray', 'beşiktaş', 'trabzonspor',
  'eczacıbaşı', 'vakıfbank', 'anadolu efes', 'arda güler', 'hakan çalhanoğlu', 'kenan yıldız',
  'ferdi kadıoğlu', 'alperen şengün', 'milli', 'ay yıldız'
];

export async function processNLPEngine(title: string, content: string, sourceName?: string): Promise<SuperPayload> {
  try {
    // 1. Extract Entities (from original English/foreign text)
    const doc = nlp(`${title}. ${content}`);
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const organizations = doc.organizations().out('array');
    
    const entities: Array<{name: string, type: string}> = [];
    people.slice(0, 3).forEach((p: string) => entities.push({ name: p, type: 'PLAYER' }));
    organizations.slice(0, 3).forEach((o: string) => entities.push({ name: o, type: 'TEAM' }));
    places.slice(0, 2).forEach((p: string) => entities.push({ name: p, type: 'LOCATION' }));

    // 2. Translate Title and Content to Turkish
    const translatedTitleRes = await translate(title, { to: 'tr' });
    const translatedTitle = translatedTitleRes.text;

    // Google Translate API has text limits, we chunk content or just translate the first 3000 chars
    const contentToTranslate = content.length > 3000 ? content.substring(0, 3000) + '...' : content;
    const translatedContentRes = await translate(contentToTranslate, { to: 'tr' });
    const translatedContent = translatedContentRes.text;

    // Clean up content by splitting into paragraphs
    const paragraphs = translatedContent.split('\n').filter(p => p.trim().length > 0);
    const htmlContent = paragraphs.map(p => `<p>${p}</p>`).join('');

    // 3. Summarization (Extractive simple approach)
    // We'll use the first 1-3 sentences for summaries
    const sentences = translatedContent.match(/[^.!?]+[.!?]+/g) || [translatedContent];
    const summaryShort = sentences[0] || translatedTitle;
    const summaryMedium = sentences.slice(0, Math.min(3, sentences.length)).join(' ') || summaryShort;
    const summaryLong = sentences.slice(0, Math.min(5, sentences.length)).join(' ') || summaryMedium;

    // 4. SEO & Keywords
    const extractionResult = keywordExtractor.extract(translatedContent, {
      language: "turkish" as any,
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });
    
    // Fallback if keyword extractor returns empty (e.g., if language file misses something)
    const rawWords = translatedContent.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const tags = extractionResult.length > 0 ? extractionResult.slice(0, 5) : rawWords.slice(0, 5);
    const focusKeyword = tags[0] || 'spor';

    // 5. Milli Haber Detection
    const combinedText = `${translatedTitle} ${translatedContent}`.toLowerCase();
    const isMilliHaber = MILLI_KEYWORDS.some(kw => combinedText.includes(kw));

    // 6. Push Notification
    // Push title is max 50 chars, body is max 150 chars
    const pushTitle = translatedTitle.length > 50 ? translatedTitle.substring(0, 47) + '...' : translatedTitle;
    const pushBody = summaryShort.length > 150 ? summaryShort.substring(0, 147) + '...' : summaryShort;

    // 7. Timeline Event (Only for breaking/major news logically, but we'll create a basic one)
    const timelineEvent = {
      topic: translatedTitle.substring(0, 40),
      description: summaryShort
    };

    return {
      rewrittenTitle: translatedTitle,
      rewrittenContent: htmlContent,
      summaries: {
        summaryShort,
        summaryMedium,
        summaryLong
      },
      seo: {
        metaTitle: translatedTitle.substring(0, 60),
        metaDescription: summaryShort.substring(0, 160),
        focusKeyword,
        tags
      },
      isMilliHaber,
      pushNotification: {
        notificationTitle: pushTitle,
        notificationBody: pushBody
      },
      entities,
      timelineEvent
    };
  } catch (error) {
    console.error('[NLPEngine] Failed to process:', error);
    throw error;
  }
}

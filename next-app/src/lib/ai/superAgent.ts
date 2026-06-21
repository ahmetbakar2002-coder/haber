import { executeGeminiPrompt } from './geminiClient';

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

export async function processSuperPrompt(title: string, content: string, sourceName?: string): Promise<SuperPayload> {
  const prompt = `
You are a master sports journalist, SEO expert, and data extractor.
Your task is to process the following news article and return a SINGLE, COMPREHENSIVE JSON object containing all required fields.

Article Title: ${title}
Article Content: ${content}
Source: ${sourceName || 'Unknown'}

Instructions:
1. Translate and rewrite the article into TURKISH to be engaging, professional, and unique (avoid plagiarism). All text outputs MUST be in Turkish.
2. Generate 3 summaries in Turkish (short, medium, long).
3. Generate SEO metadata (metaTitle, metaDescription, focusKeyword, and up to 5 tags).
4. Determine if this news is strongly related to Turkish national teams or Turkish athletes (isMilliHaber: true/false).
5. If the news is highly important, generate a push notification title and body. Otherwise, set pushNotification to null.
6. Extract key entities (players, teams, leagues) with types ('PLAYER', 'TEAM', 'LEAGUE', 'LOCATION', 'CONCEPT').
7. If the news describes a significant chronological event (e.g. "Match happened", "Transfer completed"), generate a timeline event with a short topic and description. Otherwise set timelineEvent to null.

Output purely in JSON format matching this structure exactly:
{
  "rewrittenTitle": "string",
  "rewrittenContent": "string (formatted in HTML paragraphs)",
  "summaries": {
    "summaryShort": "string",
    "summaryMedium": "string",
    "summaryLong": "string"
  },
  "seo": {
    "metaTitle": "string",
    "metaDescription": "string",
    "focusKeyword": "string",
    "tags": ["string"]
  },
  "isMilliHaber": boolean,
  "pushNotification": {
    "notificationTitle": "string",
    "notificationBody": "string"
  } | null,
  "entities": [
    { "name": "string", "type": "string" }
  ],
  "timelineEvent": {
    "topic": "string",
    "description": "string"
  } | null
}
`;

  try {
    const responseText = await executeGeminiPrompt(prompt);
    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('Could not parse Super Prompt JSON from response');
    }
    const result: SuperPayload = JSON.parse(match[0]);
    return result;
  } catch (error) {
    console.error('[SuperAgent] Failed to process:', error);
    throw error;
  }
}

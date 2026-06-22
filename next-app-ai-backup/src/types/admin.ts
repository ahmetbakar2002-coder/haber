// These types define the data contracts for the ÇAKÜ Spor Admin Dashboard UI.

export interface AdminDashboardStats {
  last24HoursProcessed: number;
  failedArticles: number;
  estimatedGeminiCost: number; // in USD
  topActiveSources: { sourceName: string; count: number }[];
  averageProcessingTimeMs: number;
}

export interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  sourceName: string;
  category: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  priorityScore: number;
  trendScore: number;
  isBreaking: boolean;
  isMilliHaber: boolean;
  publishedAt: string | null;
}

export interface NewsApprovalModel {
  articleId: string;
  originalTitle: string;
  rewrittenTitle: string;
  rewrittenContent: string;
  summaryShort: string | null;
  transferConfidence: number | null;
  viralityScore: number;
  sourceUrl: string;
}

export interface TimelineEventModel {
  id: string;
  topic: string;
  eventDate: string;
  description: string;
  articleId: string;
  articleTitle: string;
}

export interface RejectedNewsModel {
  articleId: string;
  title: string;
  sourceUrl: string;
  rejectReason: string;
  rejectedAt: string;
}

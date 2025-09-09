export interface BrandConfig {
  name: string;
  domain: string;
}

export interface AIOverview {
  keyword: string;
  markdown: string;
  references: Reference[];
  referenceCount: number;
}

export interface Reference {
  rank: number;
  domain: string;
  source: string;
  url: string;
}

export interface Competitor {
  brand: string;
  citedCount: number;
  uniqueDomains: string[];
  averageRank: number;
  citedProbability: number;
  citedInPrompts: number;
  promptCitedRate: number;
  mentioned?: number;
  mentionRate?: number;
}

export interface AnalysisResults {
  keywords: KeywordData[];
  aiOverviews: AIOverview[];
  competitors: Competitor[];
  brandMentions: BrandMention[];
}

export interface KeywordData {
  keyword: string;
  hasAIOverview: boolean;
  referenceCount?: number;
  brandRank?: number;
}

export interface BrandMention {
  competitor: string;
  citedInPrompts: number;
  averageRank: number;
  mentioned: number;
  mentionRate: number;
}

export interface DataForSEOItem {
  keyword: string;
  type: string;
  items: Array<{
    type: string;
    markdown?: string;
    references?: any[];
    [key: string]: any;
  }>;
  [key: string]: any;
}
import {
  BrandConfig,
  AIOverview,
  Competitor,
  AnalysisResults,
  KeywordData,
  BrandMention,
  DataForSEOItem,
  Reference,
} from './types';

export async function analyzeData(
  data: any,
  config: BrandConfig
): Promise<AnalysisResults> {
  // Extract data items from nested structure
  const dataItems = extractDataItems(data);
  
  // Process keywords and AI overviews
  const { keywords, aiOverviews } = processKeywords(dataItems, config);
  
  // Analyze competitors
  const competitors = analyzeCompetitors(aiOverviews);
  
  // Analyze brand mentions
  const brandMentions = analyzeBrandMentions(competitors, aiOverviews);
  
  return {
    keywords,
    aiOverviews,
    competitors,
    brandMentions,
  };
}

function extractDataItems(data: any): DataForSEOItem[] {
  // Handle different JSON structures
  if (Array.isArray(data)) {
    return data;
  }
  
  if (typeof data === 'object' && data['0']) {
    const nested = data['0'];
    if (typeof nested === 'object') {
      return Object.values(nested);
    }
  }
  
  return [];
}

function processKeywords(
  items: DataForSEOItem[],
  config: BrandConfig
): { keywords: KeywordData[], aiOverviews: AIOverview[] } {
  const keywords: KeywordData[] = [];
  const aiOverviews: AIOverview[] = [];
  
  for (const item of items) {
    const hasAIOverview = item.items?.some(i => i.type === 'ai_overview') || false;
    
    const keywordData: KeywordData = {
      keyword: item.keyword,
      hasAIOverview,
    };
    
    if (hasAIOverview && item.items) {
      const aioItem = item.items.find(i => i.type === 'ai_overview');
      
      if (aioItem) {
        const references = cleanReferences(aioItem.references || []);
        const brandRank = getBrandRank(references, config);
        
        keywordData.referenceCount = references.length;
        keywordData.brandRank = brandRank;
        
        aiOverviews.push({
          keyword: item.keyword,
          markdown: cleanMarkdown(aioItem.markdown || ''),
          references,
          referenceCount: references.length,
        });
      }
    }
    
    keywords.push(keywordData);
  }
  
  return { keywords, aiOverviews };
}

function cleanReferences(refs: any[]): Reference[] {
  if (!refs || !Array.isArray(refs)) return [];
  
  return refs.map((ref, idx) => ({
    rank: idx + 1,
    domain: ref.domain || '',
    source: ref.source || '',
    url: ref.url || '',
  }));
}

function cleanMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // Remove citation links [[x]](url)
  let cleaned = markdown.replace(/\s*\[\[[^\[\]]+\]\]\s*\([^)]+\)/g, '');
  
  // Convert [text](url) to text
  cleaned = cleaned.replace(/(?<!!)\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove images
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  
  // Clean whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1');
  
  return cleaned.trim();
}

function getBrandRank(
  references: Reference[],
  config: BrandConfig
): number | undefined {
  const brandDomainLower = config.domain.toLowerCase();
  const brandNameLower = config.name.toLowerCase();
  
  for (const ref of references) {
    const domain = ref.domain.toLowerCase();
    const source = ref.source.toLowerCase();
    
    if (domain.includes(brandDomainLower) || source.includes(brandNameLower)) {
      return ref.rank;
    }
  }
  
  return undefined;
}

function analyzeCompetitors(aiOverviews: AIOverview[]): Competitor[] {
  const competitorMap = new Map<string, Competitor>();
  const totalCitations = aiOverviews.reduce((sum, aio) => sum + aio.references.length, 0);
  
  for (const aio of aiOverviews) {
    for (const ref of aio.references) {
      const source = ref.source;
      if (!source) continue;
      
      if (!competitorMap.has(source)) {
        competitorMap.set(source, {
          brand: source,
          citedCount: 0,
          uniqueDomains: [],
          averageRank: 0,
          citedProbability: 0,
          citedInPrompts: 0,
          promptCitedRate: 0,
        });
      }
      
      const competitor = competitorMap.get(source)!;
      competitor.citedCount++;
      
      if (!competitor.uniqueDomains.includes(ref.domain)) {
        competitor.uniqueDomains.push(ref.domain);
      }
      
      // Update average rank (running average)
      competitor.averageRank = 
        (competitor.averageRank * (competitor.citedCount - 1) + ref.rank) / 
        competitor.citedCount;
    }
  }
  
  // Calculate cited in prompts and probabilities
  for (const competitor of competitorMap.values()) {
    competitor.citedProbability = competitor.citedCount / totalCitations;
    
    // Count prompts where competitor is cited
    let promptCount = 0;
    for (const aio of aiOverviews) {
      if (aio.references.some(ref => ref.source === competitor.brand)) {
        promptCount++;
      }
    }
    competitor.citedInPrompts = promptCount;
    competitor.promptCitedRate = promptCount / aiOverviews.length;
  }
  
  return Array.from(competitorMap.values())
    .sort((a, b) => b.citedCount - a.citedCount);
}

function analyzeBrandMentions(
  competitors: Competitor[],
  aiOverviews: AIOverview[]
): BrandMention[] {
  return competitors.map(competitor => {
    let mentionCount = 0;
    
    for (const aio of aiOverviews) {
      if (checkBrandMention(competitor.brand, aio.markdown)) {
        mentionCount++;
      }
    }
    
    return {
      competitor: competitor.brand,
      citedInPrompts: competitor.citedInPrompts,
      averageRank: competitor.averageRank,
      mentioned: mentionCount,
      mentionRate: mentionCount / aiOverviews.length,
    };
  }).sort((a, b) => b.citedInPrompts - a.citedInPrompts);
}

function checkBrandMention(brand: string, text: string): boolean {
  if (!text || !brand) return false;
  
  const pattern = new RegExp(`\\b${escapeRegex(brand)}\\b`, 'i');
  return pattern.test(text);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
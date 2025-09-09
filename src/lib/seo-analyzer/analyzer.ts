import type {
  BrandConfig,
  AIOverview,
  Competitor,
  AnalysisResults,
  KeywordData,
  BrandMention,
  DataForSEOItem,
  Reference,
} from "./types";

export async function analyzeData(
  data: any,
  config: BrandConfig,
): Promise<AnalysisResults> {
  const dataItems = extractDataItems(data);

  const { keywords, aiOverviews } = processKeywords(dataItems, config);

  const competitors = analyzeCompetitors(aiOverviews);

  const brandMentions = analyzeBrandMentions(competitors, aiOverviews);

  return {
    keywords,
    aiOverviews,
    competitors,
    brandMentions,
  };
}

function extractDataItems(data: any): DataForSEOItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "object" && data["0"]) {
    const nested = data["0"];
    if (typeof nested === "object") {
      return Object.values(nested);
    }
  }

  return [];
}

function processKeywords(
  items: DataForSEOItem[],
  config: BrandConfig,
): { keywords: KeywordData[]; aiOverviews: AIOverview[] } {
  const keywords: KeywordData[] = [];
  const aiOverviews: AIOverview[] = [];

  for (const item of items) {
    const hasAIOverview =
      item.items?.some((i) => i.type === "ai_overview") || false;

    const keywordData: KeywordData = {
      keyword: item.keyword,
      hasAIOverview,
    };

    if (hasAIOverview && item.items) {
      const aioItem = item.items.find((i) => i.type === "ai_overview");

      if (aioItem) {
        const references = cleanReferences(aioItem.references || []);
        const brandRank = getBrandRank(references, config);

        keywordData.referenceCount = references.length;
        keywordData.brandRank = brandRank;

        aiOverviews.push({
          keyword: item.keyword,
          markdown: cleanMarkdown(aioItem.markdown || ""),
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
    domain: ref.domain || "",
    source: ref.source || "",
    url: ref.url || "",
  }));
}

function cleanMarkdown(markdown: string): string {
  if (!markdown) return "";

  let cleaned = markdown.replace(/\s*\[\[[^\[\]]+\]\]\s*\([^)]+\)/g, "");

  cleaned = cleaned.replace(/(?<!!)\[([^\]]+)\]\([^)]+\)/g, "$1");

  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, "$1");

  return cleaned.trim();
}

function getBrandRank(
  references: Reference[],
  config: BrandConfig,
): number | undefined {
  const brandDomainLower = config.domain.toLowerCase();
  const brandNameLower = config.name.toLowerCase();

  for (const ref of references) {
    const domain = ref.domain.toLowerCase();
    const source = ref.source.toLowerCase();

    if (
      domain.includes(brandDomainLower) ||
      source.includes(brandNameLower)
    ) {
      return ref.rank;
    }
  }

  return undefined;
}

function analyzeCompetitors(aiOverviews: AIOverview[]): Competitor[] {
  const competitorMap = new Map<string, Competitor>();
  const totalCitations = aiOverviews.reduce(
    (sum, aio) => sum + aio.references.length,
    0,
  );

  // First, group by domain to identify real brands
  const domainSourceMap = new Map<string, Set<string>>();
  
  for (const aio of aiOverviews) {
    for (const ref of aio.references) {
      if (!ref.domain || !ref.source) continue;
      
      if (!domainSourceMap.has(ref.domain)) {
        domainSourceMap.set(ref.domain, new Set());
      }
      domainSourceMap.get(ref.domain)!.add(ref.source);
    }
  }

  // Now process references, using domain as primary identifier when source appears across many domains
  for (const aio of aiOverviews) {
    for (const ref of aio.references) {
      const source = ref.source;
      const domain = ref.domain;
      if (!source || !domain) continue;

      // Check if this source appears across multiple unrelated domains
      const sourceDomainsCount = Array.from(domainSourceMap.values()).filter(
        sources => sources.has(source)
      ).length;
      
      // If source appears across > 3 different domains, use domain as the competitor identifier
      // This prevents generic terms like "Thang máy" from being grouped together
      const competitorKey = sourceDomainsCount > 3 ? domain : source;
      const competitorName = sourceDomainsCount > 3 ? domain : source;

      if (!competitorMap.has(competitorKey)) {
        competitorMap.set(competitorKey, {
          brand: competitorName,
          citedCount: 0,
          uniqueDomains: [],
          averageRank: 0,
          citedProbability: 0,
          citedInPrompts: 0,
          promptCitedRate: 0,
        });
      }

      const competitor = competitorMap.get(competitorKey)!;
      competitor.citedCount++;

      if (!competitor.uniqueDomains.includes(domain)) {
        competitor.uniqueDomains.push(domain);
      }

      competitor.averageRank =
        (competitor.averageRank * (competitor.citedCount - 1) + ref.rank) /
        competitor.citedCount;
    }
  }

  for (const competitor of competitorMap.values()) {
    competitor.citedProbability = competitor.citedCount / totalCitations;

    let promptCount = 0;
    for (const aio of aiOverviews) {
      // Check if this competitor appears in the references
      const hasCompetitor = aio.references.some((ref) => {
        // Match by brand name or domain
        return ref.source === competitor.brand || 
               ref.domain === competitor.brand ||
               competitor.uniqueDomains.includes(ref.domain);
      });
      
      if (hasCompetitor) {
        promptCount++;
      }
    }
    competitor.citedInPrompts = promptCount;
    competitor.promptCitedRate = promptCount / aiOverviews.length;
  }

  return Array.from(competitorMap.values()).sort(
    (a, b) => b.citedCount - a.citedCount,
  );
}

function analyzeBrandMentions(
  competitors: Competitor[],
  aiOverviews: AIOverview[],
): BrandMention[] {
  return competitors
    .map((competitor) => {
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
    })
    .sort((a, b) => b.citedInPrompts - a.citedInPrompts);
}

function checkBrandMention(brand: string, text: string): boolean {
  if (!text || !brand) return false;

  const pattern = new RegExp(`\\b${escapeRegex(brand)}\\b`, "i");
  return pattern.test(text);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
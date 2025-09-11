import re
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict

from models import (
    BrandConfig, AIOverview, Competitor, AnalysisResults, 
    KeywordData, BrandMention, Reference, DataForSEOItem
)


async def analyze_data(data: Dict[str, Any], config: BrandConfig) -> Dict[str, Any]:
    """Main analysis function that processes DataForSEO data"""
    data_items = extract_data_items(data)
    
    keywords, ai_overviews = process_keywords(data_items, config)
    competitors = analyze_competitors(ai_overviews)
    brand_mentions = analyze_brand_mentions(competitors, ai_overviews)
    
    return {
        "keywords": [kw.dict(by_alias=True) for kw in keywords],
        "aiOverviews": [aio.dict(by_alias=True) for aio in ai_overviews],
        "competitors": [comp.dict(by_alias=True) for comp in competitors],
        "brandMentions": [bm.dict(by_alias=True) for bm in brand_mentions]
    }


def extract_data_items(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract DataForSEO items from the nested data structure"""
    if isinstance(data, list):
        return data
    
    if isinstance(data, dict) and "0" in data:
        nested = data["0"]
        if isinstance(nested, dict):
            return list(nested.values())
    
    return []


def process_keywords(
    items: List[Dict[str, Any]], 
    config: BrandConfig
) -> Tuple[List[KeywordData], List[AIOverview]]:
    """Process keywords and extract AI overviews"""
    keywords = []
    ai_overviews = []
    
    for item in items:
        has_ai_overview = False
        if item.get("items"):
            has_ai_overview = any(i.get("type") == "ai_overview" for i in item["items"])
        
        keyword_data = KeywordData(
            keyword=item.get("keyword", ""),
            hasAIOverview=has_ai_overview
        )
        
        if has_ai_overview and item.get("items"):
            aio_item = next((i for i in item["items"] if i.get("type") == "ai_overview"), None)
            
            if aio_item:
                references = clean_references(aio_item.get("references", []))
                brand_rank = get_brand_rank(references, config)
                
                keyword_data.referenceCount = len(references)
                keyword_data.brandRank = brand_rank
                
                ai_overviews.append(AIOverview(
                    keyword=item.get("keyword", ""),
                    markdown=clean_markdown(aio_item.get("markdown", "")),
                    references=references,
                    referenceCount=len(references)
                ))
        
        keywords.append(keyword_data)
    
    return keywords, ai_overviews


def clean_references(refs: List[Dict[str, Any]]) -> List[Reference]:
    """Clean and structure reference data"""
    if not refs or not isinstance(refs, list):
        return []
    
    return [
        Reference(
            rank=idx + 1,
            domain=ref.get("domain", ""),
            source=ref.get("source", ""),
            url=ref.get("url", "")
        )
        for idx, ref in enumerate(refs)
    ]


def clean_markdown(markdown: str) -> str:
    """Clean markdown content by removing citations and formatting"""
    if not markdown:
        return ""
    
    # Remove citation links like [[text]](url)
    cleaned = re.sub(r'\s*\[\[[^\[\]]+\]\]\s*\([^)]+\)', '', markdown)
    
    # Remove regular links but keep text
    cleaned = re.sub(r'(?<!!)\[([^\]]+)\]\([^)]+\)', r'\1', cleaned)
    
    # Remove images
    cleaned = re.sub(r'!\[([^\]]*)\]\([^)]+\)', '', cleaned)
    
    # Clean up whitespace
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    cleaned = re.sub(r'\s+([.,;:!?])', r'\1', cleaned)
    
    return cleaned.strip()


def get_brand_rank(references: List[Reference], config: BrandConfig) -> Optional[int]:
    """Find the rank of the user's brand in references"""
    brand_domain_lower = config.domain.lower()
    brand_name_lower = config.name.lower()
    
    for ref in references:
        domain = ref.domain.lower()
        source = ref.source.lower()
        
        if brand_domain_lower in domain or brand_name_lower in source:
            return ref.rank
    
    return None


def analyze_competitors(ai_overviews: List[AIOverview]) -> List[Competitor]:
    """Analyze competitor citations and mentions"""
    competitor_map = {}
    total_citations = sum(len(aio.references) for aio in ai_overviews)
    
    # Group by domain to identify real brands
    domain_source_map = defaultdict(set)
    
    for aio in ai_overviews:
        for ref in aio.references:
            if ref.domain and ref.source:
                domain_source_map[ref.domain].add(ref.source)
    
    # Process references
    for aio in ai_overviews:
        for ref in aio.references:
            if not ref.source or not ref.domain:
                continue
            
            # Check if source appears across multiple domains
            source_domains_count = sum(
                1 for sources in domain_source_map.values() 
                if ref.source in sources
            )
            
            # Use domain as competitor key if source appears across > 3 domains
            competitor_key = ref.domain if source_domains_count > 3 else ref.source
            competitor_name = ref.domain if source_domains_count > 3 else ref.source
            
            if competitor_key not in competitor_map:
                competitor_map[competitor_key] = Competitor(
                    brand=competitor_name,
                    citedCount=0,
                    uniqueDomains=[],
                    averageRank=0.0,
                    citedProbability=0.0,
                    citedInPrompts=0,
                    promptCitedRate=0.0
                )
            
            competitor = competitor_map[competitor_key]
            competitor.citedCount += 1
            
            if ref.domain not in competitor.uniqueDomains:
                competitor.uniqueDomains.append(ref.domain)
            
            # Update average rank
            competitor.averageRank = (
                (competitor.averageRank * (competitor.citedCount - 1) + ref.rank) /
                competitor.citedCount
            )
    
    # Calculate probabilities and prompt counts
    for competitor in competitor_map.values():
        if total_citations > 0:
            competitor.citedProbability = competitor.citedCount / total_citations
        
        prompt_count = 0
        for aio in ai_overviews:
            has_competitor = any(
                ref.source == competitor.brand or 
                ref.domain == competitor.brand or
                ref.domain in competitor.uniqueDomains
                for ref in aio.references
            )
            
            if has_competitor:
                prompt_count += 1
        
        competitor.citedInPrompts = prompt_count
        if ai_overviews:
            competitor.promptCitedRate = prompt_count / len(ai_overviews)
    
    # Sort by citation count
    return sorted(competitor_map.values(), key=lambda x: x.citedCount, reverse=True)


def analyze_brand_mentions(
    competitors: List[Competitor], 
    ai_overviews: List[AIOverview]
) -> List[BrandMention]:
    """Analyze brand mentions in AI overview content"""
    brand_mentions = []
    
    for competitor in competitors:
        mention_count = 0
        
        for aio in ai_overviews:
            if check_brand_mention(competitor.brand, aio.markdown):
                mention_count += 1
        
        mention_rate = mention_count / len(ai_overviews) if ai_overviews else 0
        
        brand_mentions.append(BrandMention(
            competitor=competitor.brand,
            citedInPrompts=competitor.citedInPrompts,
            averageRank=competitor.averageRank,
            mentioned=mention_count,
            mentionRate=mention_rate
        ))
    
    return sorted(brand_mentions, key=lambda x: x.citedInPrompts, reverse=True)


def check_brand_mention(brand: str, text: str) -> bool:
    """Check if a brand is mentioned in text using regex"""
    if not text or not brand:
        return False
    
    # Escape special regex characters in brand name
    escaped_brand = re.escape(brand)
    pattern = re.compile(rf'\b{escaped_brand}\b', re.IGNORECASE)
    
    return bool(pattern.search(text))
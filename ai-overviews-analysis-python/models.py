from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class BrandConfig(BaseModel):
    name: str
    domain: str


class KeywordFetchRequest(BaseModel):
    keywords: List[str]
    brand_name: str
    brand_domain: str
    location_code: int = 2704
    language_code: str = "vi"
    fast_mode: bool = False


class AnalysisRequest(BaseModel):
    brand_name: str
    brand_domain: str
    data: Dict[str, Any]


class Reference(BaseModel):
    rank: int
    domain: str
    source: str
    url: str


class AIOverview(BaseModel):
    keyword: str
    markdown: str
    references: List[Reference]
    reference_count: int = Field(alias="referenceCount")


class KeywordData(BaseModel):
    keyword: str
    has_ai_overview: bool = Field(alias="hasAIOverview")
    reference_count: Optional[int] = Field(None, alias="referenceCount")
    brand_rank: Optional[int] = Field(None, alias="brandRank")


class Competitor(BaseModel):
    brand: str
    cited_count: int = Field(alias="citedCount")
    unique_domains: List[str] = Field(alias="uniqueDomains")
    average_rank: float = Field(alias="averageRank")
    cited_probability: float = Field(alias="citedProbability")
    cited_in_prompts: int = Field(alias="citedInPrompts")
    prompt_cited_rate: float = Field(alias="promptCitedRate")
    mentioned: Optional[int] = None
    mention_rate: Optional[float] = Field(None, alias="mentionRate")


class BrandMention(BaseModel):
    competitor: str
    cited_in_prompts: int = Field(alias="citedInPrompts")
    average_rank: float = Field(alias="averageRank")
    mentioned: int
    mention_rate: float = Field(alias="mentionRate")


class AnalysisResults(BaseModel):
    keywords: List[KeywordData]
    ai_overviews: List[AIOverview] = Field(alias="aiOverviews")
    competitors: List[Competitor]
    brand_mentions: List[BrandMention] = Field(alias="brandMentions")


class DataForSEOItem(BaseModel):
    keyword: str
    type: str
    items: Optional[List[Dict[str, Any]]] = None
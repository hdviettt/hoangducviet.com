import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeData } from '../../../lib/seo-analyzer/analyzer';
import { BrandConfig } from '../../../lib/seo-analyzer/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandName, brandDomain, data } = req.body;

    if (!brandName || !brandDomain || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: brandName, brandDomain, data' 
      });
    }

    const config: BrandConfig = {
      name: brandName,
      domain: brandDomain,
    };

    const results = await analyzeData(data, config);

    res.status(200).json({
      success: true,
      results,
      summary: {
        totalKeywords: results.keywords.length,
        aiOverviewCount: results.aiOverviews.length,
        competitorCount: results.competitors.length,
        brandMentions: results.brandMentions,
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
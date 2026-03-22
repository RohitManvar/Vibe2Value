// Core Domain Types for RoCathon Hybrid Search

export interface CreatorMetrics {
  follower_count: number;
  total_gmv_30d: number;
  avg_views_30d: number;
  engagement_rate: number;
  gpm: number;
  demographics: {
    major_gender: string;
    gender_pct: number;
    age_ranges: string[];
  };
}

export interface CreatorRecord {
  username: string;
  bio: string;
  content_style_tags: string[];
  projected_score: number;
  metrics: CreatorMetrics;
}

export interface BrandProfile {
  id: string;
  industries: string[];
  target_audience: {
    gender: string;
    age_ranges: string[];
  };
  gmv: number;
}

export interface RankedCreator extends CreatorRecord {
  scores: {
    semantic_score: number;
    projected_score: number;
    final_score: number;
  };
  rank: number;
}

export interface SearchQuery {
  query: string;
  brand?: BrandProfile;
  industries?: string[];
  limit?: number;
}

export interface SearchResponse {
  results: RankedCreator[];
  query: string;
  total: number;
  latency_ms: number;
}

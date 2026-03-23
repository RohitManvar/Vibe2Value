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

export interface RankedCreator {
  username: string;
  bio: string;
  content_style_tags: string[];
  projected_score: number;
  metrics: CreatorMetrics;
  platform: string;
  region: string;
  category: string;
  scores: {
    semantic_score: number;
    projected_score: number;
    final_score: number;
  };
  rank: number;
}

export interface BrandProfile {
  id: string;
  label: string;
  industries: string[];
  target_audience: { gender: string; age_ranges: string[] };
  gmv: number;
}

export interface SearchResponse {
  results: RankedCreator[];
  query: string;
  total: number;
  latency_ms: number;
}

export interface MetaResponse {
  total: number;
  platforms: { value: string; count: number }[];
  regions: { value: string; count: number }[];
  categories: { value: string; count: number }[];
}

export const BRAND_PROFILES: Record<string, BrandProfile> = {
  brand_smart_home: {
    id: "brand_smart_home",
    label: "Smart Home",
    industries: ["Home"],
    target_audience: { gender: "FEMALE", age_ranges: ["25-34", "35-44"] },
    gmv: 75000,
  },
  brand_active_life: {
    id: "brand_active_life",
    label: "Active Life",
    industries: ["Sports & Outdoors", "Health"],
    target_audience: { gender: "MALE", age_ranges: ["18-24", "25-34"] },
    gmv: 50000,
  },
  brand_glow_beauty: {
    id: "brand_glow_beauty",
    label: "Glow Beauty",
    industries: ["Beauty", "Fashion"],
    target_audience: { gender: "FEMALE", age_ranges: ["18-24", "25-34"] },
    gmv: 60000,
  },
};

export const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG",
  tiktok: "TT",
  youtube: "YT",
  twitter: "TW",
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  tiktok: "#010101",
  youtube: "#ff0000",
  twitter: "#1da1f2",
};

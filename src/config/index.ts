import dotenv from 'dotenv';
import type { BrandProfile } from "../types/index.js";

dotenv.config();

export const DB_CONFIG = {
  connectionString: process.env.DB_URL ||
    "postgresql://postgres:postgres@localhost:5433/v2v"
};

export const EMBEDDING_CONFIG = {
  model: process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2",
  dimensions: parseInt(process.env.EMBEDDING_DIMENSION || "384")
};

export const DEFAULT_WEIGHTS = {
  semantic_weight: 0.40,
  projected_weight: 0.60,
};

// Penalty multiplier applied to zero-GMV creators to enforce hard constraint
export const ZERO_GMV_PENALTY = 0.25;

export const SERVER_PORT = parseInt(process.env.PORT || "3000", 10);

// Brand profiles (from RoCathon starter repo)
export const BRAND_PROFILES: Record<string, BrandProfile> = {
  brand_smart_home: {
    id: "brand_smart_home",
    industries: ["Home"],
    target_audience: {
      gender: "FEMALE",
      age_ranges: ["25-34", "35-44"],
    },
    gmv: 75000,
  },
  brand_active_life: {
    id: "brand_active_life",
    industries: ["Sports & Outdoors", "Health"],
    target_audience: {
      gender: "MALE",
      age_ranges: ["18-24", "25-34"],
    },
    gmv: 50000,
  },
  brand_glow_beauty: {
    id: "brand_glow_beauty",
    industries: ["Beauty", "Fashion"],
    target_audience: {
      gender: "FEMALE",
      age_ranges: ["18-24", "25-34"],
    },
    gmv: 60000,
  },
};

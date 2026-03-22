import { EMBEDDING_CONFIG } from "../config/index.js";

//EMBEDDING SERVICE — @xenova/transformers (local ONNX)

// Lazy-loaded pipeline singleton
let extractorPromise: Promise<any> | null = null;

/**
 * Get or initialize the feature-extraction pipeline.
 * The model downloads automatically on first call.
 * Subsequent calls reuse the cached pipeline (instant).
 */
async function getExtractor(): Promise<any> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      // Dynamic import — @xenova/transformers is ESM-compatible
      const { pipeline } = await import("@xenova/transformers");

      console.log(`🔮 Loading embedding model: ${EMBEDDING_CONFIG.model}...`);
      const extractor = await pipeline(
        "feature-extraction",
        EMBEDDING_CONFIG.model
      );
      console.log(`✅ Embedding model loaded (${EMBEDDING_CONFIG.dimensions}d).`);
      return extractor;
    })();
  }
  return extractorPromise;
}

/**
 * Generate embedding vector for a single text input.
 *
 * @param text - The text to embed
 * @returns 384-dimensional float array (normalized, unit length)
 */
export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor();

  // Truncate — MiniLM max is ~256 tokens ≈ ~1500 chars, we allow a bit more
  const truncated = text.slice(0, 2000);

  const output = await extractor(truncated, {
    pooling: "mean",
    normalize: true,
  });

  // output.data is a Float32Array — convert to regular number[]
  return Array.from(output.data as Float32Array);
}

/**
 * Batch embed multiple texts.
 *
 * @xenova/transformers supports passing an array of strings natively.
 * For large batches we chunk to avoid memory issues.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const results: number[][] = [];

  // Process in batches of 32 (good balance of speed vs memory)
  const BATCH_SIZE = 32;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.slice(0, 2000));

    const output = await extractor(batch, {
      pooling: "mean",
      normalize: true,
    });

    // output.tolist() returns number[][] for batched input
    const vectors: number[][] = output.tolist();
    results.push(...vectors);
  }

  return results;
}

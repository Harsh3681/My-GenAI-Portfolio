import fs from "fs";
import path from "path";

// Type for embedding vectors
type Embedding = number[];

interface ResumeChunk {
  id: number;
  text: string;
  embedding: Embedding;
}

// In-memory cache for the lifetime of the server process
let cachedChunks: ResumeChunk[] | null = null;

const RESUME_PDF_PATH = path.join(
  process.cwd(),
  "public",
  "Harshal-Sonawane-Resume.pdf"
);

// OpenRouter embedding model
const EMBEDDING_MODEL = "voyage/voyage-lite-02-instruct:free";

/* ------------------------------------------------------------------
   Cosine similarity
------------------------------------------------------------------ */
function cosineSimilarity(a: Embedding, b: Embedding): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* ------------------------------------------------------------------
   Chunk text into manageable pieces (approx by character length)
------------------------------------------------------------------ */
function chunkText(text: string, maxChars = 800): string[] {
  const chunks: string[] = [];
  let current = "";

  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxChars) {
      if (current.trim().length > 0) {
        chunks.push(current.trim());
      }
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}

/* ------------------------------------------------------------------
   Call OpenRouter embeddings
------------------------------------------------------------------ */
async function getEmbeddingsForTexts(
  texts: string[]
): Promise<Embedding[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Embedding error:", errorText);
    throw new Error("Failed to get embeddings from OpenRouter");
  }

  const json = await res.json();

  // OpenRouter returns { data: [{ embedding: number[] }, ...] }
  const vectors: Embedding[] = json.data.map(
    (d: any) => d.embedding as number[]
  );

  return vectors;
}

/* ------------------------------------------------------------------
   Load + embed resume ONCE (cached in memory)
------------------------------------------------------------------ */
async function loadAndEmbedResume(): Promise<ResumeChunk[]> {
  if (cachedChunks) return cachedChunks;

  // 1. Read PDF
  const buffer = await fs.promises.readFile(RESUME_PDF_PATH);

  // pdf-parse supports dynamic import but returns a function directly (no .default)
    const pdfParseModule: any = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;

    const data = await pdfParse(buffer);
  const rawText: string = data.text || "";

  const cleanText = rawText.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    throw new Error("Extracted empty text from resume PDF");
  }

  // 3. Chunk
  const texts = chunkText(cleanText);

  // 4. Embed all chunks
  const embeddings = await getEmbeddingsForTexts(texts);

  const chunks: ResumeChunk[] = texts.map((t, i) => ({
    id: i,
    text: t,
    embedding: embeddings[i],
  }));

  cachedChunks = chunks;
  return chunks;
}

/* ------------------------------------------------------------------
   Compute relevant context for a given user query
------------------------------------------------------------------ */
export async function getRelevantResumeContext(
  query: string,
  topK = 4
): Promise<string> {
  const chunks = await loadAndEmbedResume();

  // Embed the query itself
  const [queryEmbedding] = await getEmbeddingsForTexts([query]);

  // Rank chunks by similarity
  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const context = scored
    .map((c) => c.text)
    .join("\n\n---\n\n");

  return context;
}

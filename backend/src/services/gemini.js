import { GoogleGenAI } from "@google/genai";

let cachedClient = null;
let cachedKey = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient || cachedKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedKey = apiKey;
  }
  return cachedClient;
};

export const isGeminiConfigured = () => Boolean(getClient());

export const generateGeminiRecommendations = async ({
  prompt,
  products,
  limit,
}) => {
  const client = getClient();
  if (!client) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.status = 500;
    throw error;
  }

  const candidates = (products || []).map((product) => ({
    id: product._id?.toString(),
    name: product.name,
    category: product.category?.name || "",
    price: product.price,
    rating: product.averageRating ?? 0,
    stock: product.stock ?? 0,
    description: product.description
      ? product.description.slice(0, 120)
      : "",
  }));

  const preference = prompt?.trim() || "No preference provided.";

  const userPrompt = [
    "You are a product recommendation engine.",
    `User preference: ${preference}`,
    `Return ONLY a valid JSON array with at most ${limit} items.`,
    'Each item must have keys: "productId" and "score" (0 to 1).',
    "Only choose from the candidates list.",
    `Candidates: ${JSON.stringify(candidates)}`,
  ].join("\n");

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  });

  if (typeof response?.text === "function") {
    return response.text() ?? "";
  }
  return response?.text ?? "";
};

export const generateGeminiChatResponse = async ({
  message,
  history,
  products,
}) => {
  const client = getClient();
  if (!client) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.status = 500;
    throw error;
  }

  const catalog = (products || []).map((product) => ({
    id: product._id?.toString(),
    name: product.name,
    category: product.category?.name || "",
    price: product.price,
    rating: product.averageRating ?? 0,
    stock: product.stock ?? 0,
    size: Array.isArray(product.size) ? product.size : [],
    description: product.description
      ? product.description.slice(0, 160)
      : "",
  }));

  const systemPrompt = [
    "You are a helpful shopping assistant for our store.",
    "Answer in Vietnamese.",
    "Use only the provided product catalog for product details.",
    "If a specific product is not in the catalog, say you can't find it and suggest similar items from the catalog.",
    "If the user asks for recommendations, suggest up to 3 products from the catalog with name and price.",
    "Keep answers concise and friendly.",
    `Product catalog: ${JSON.stringify(catalog)}`,
  ].join("\n");

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
  ];

  (history || []).forEach((entry) => {
    if (!entry?.role || !entry?.text) return;
    contents.push({ role: entry.role, parts: [{ text: entry.text }] });
  });

  contents.push({ role: "user", parts: [{ text: message }] });

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  if (typeof response?.text === "function") {
    return response.text() ?? "";
  }
  return response?.text ?? "";
};

import ChatbotLog from "../models/ChatbotLog.js";
import Product from "../models/Product.js";
import { generateGeminiChatResponse } from "../services/gemini.js";
import { logAIBehavior } from "../services/aiBehavior.js";

const MAX_HISTORY_TURNS = 6;
const MAX_PRODUCTS = 60;

const STOP_WORDS = new Set([
  "co",
  "có",
  "khong",
  "không",
  "nhung",
  "những",
  "size",
  "nao",
  "nào",
  "gia",
  "giá",
  "loai",
  "loại",
  "mau",
  "màu",
  "hang",
  "hãng",
  "san",
  "sản",
  "pham",
  "phẩm",
  "giay",
  "giày",
  "ao",
  "áo",
  "quan",
  "quần",
  "cho",
  "toi",
  "tôi",
  "minh",
  "mình",
  "voi",
  "với",
  "muon",
  "muốn",
  "can",
  "cần",
  "tu",
  "tư",
  "van",
  "vấn",
  "giup",
  "giúp",
  "tim",
  "tìm",
  "kiem",
  "kiếm",
  "thong",
  "thông",
  "tin",
  "tin",
  "ve",
  "về",
]);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractKeywords = (message) => {
  if (!message) return [];
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z0-9À-ỹ\s]/gi, " ");
  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
  return Array.from(new Set(tokens)).slice(0, 6);
};

const buildHistory = (logs) => {
  const ordered = [...logs].reverse();
  const history = [];
  for (const log of ordered) {
    if (log?.message) {
      history.push({ role: "user", text: log.message });
    }
    if (log?.response) {
      history.push({ role: "model", text: log.response });
    }
  }
  return history;
};

const pickSuggestedProducts = (responseText, products, limit = 3) => {
  if (!responseText || !products?.length) return [];
  const lower = responseText.toLowerCase();
  const matches = [];
  for (const product of products) {
    const names = [product?.name, product?.title].filter(Boolean);
    const hasMatch = names.some((name) =>
      lower.includes(String(name).toLowerCase()),
    );
    if (hasMatch) {
      matches.push(product);
    }
    if (matches.length >= limit) break;
  }
  return matches;
};

export const chatWithGemini = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const productIds = Array.isArray(req.body?.productIds)
      ? req.body.productIds
      : null;

    const logs = await ChatbotLog.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_TURNS)
      .lean();

    const history = buildHistory(logs);

    let productQuery = { stock: { $gt: 0 } };
    let keywordTokens = [];
    if (productIds?.length) {
      productQuery = { _id: { $in: productIds } };
    } else {
      keywordTokens = extractKeywords(message);
      if (keywordTokens.length > 0) {
        const pattern = keywordTokens.map(escapeRegex).join("|");
        productQuery = {
          $and: [
            { stock: { $gt: 0 } },
            {
              $or: [
                { name: { $regex: pattern, $options: "i" } },
                { title: { $regex: pattern, $options: "i" } },
                { description: { $regex: pattern, $options: "i" } },
              ],
            },
          ],
        };
      }
    }

    let products = await Product.find(productQuery)
      .populate("category", "name")
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(MAX_PRODUCTS)
      .lean();

    if (!products.length && !productIds?.length) {
      products = await Product.find({ stock: { $gt: 0 } })
        .populate("category", "name")
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(MAX_PRODUCTS)
        .lean();
    }

    const responseText = await generateGeminiChatResponse({
      message,
      history,
      products,
    });

    const matchedProducts = pickSuggestedProducts(responseText, products, 3);
    const suggestionProducts =
      matchedProducts.length > 0 ? matchedProducts : products.slice(0, 3);
    const suggestions = suggestionProducts.map((product) => ({
      productId: product._id?.toString(),
      name: product.name,
      price: product.price,
      thumbnailUrl: Array.isArray(product.images) ? product.images[0] || "" : "",
      images: Array.isArray(product.images) ? product.images : [],
      size: Array.isArray(product.size) ? product.size : [],
      category: product.category?.name || "",
    }));

    const newLog = await ChatbotLog.create({
      user: req.userId,
      message,
      response: responseText,
    });

    const suggestionIds = Array.from(
      new Set(
        suggestions
          .map((item) => item.productId)
          .filter(Boolean)
          .map((item) => String(item)),
      ),
    );

    logAIBehavior({
      user: req.userId,
      flow: "chatbot",
      action: "chat_message",
      message,
      productIds: suggestionIds,
      metadata: {
        chatLogId: newLog._id?.toString(),
        inputProductIds: Array.isArray(productIds)
          ? productIds.map((id) => String(id))
          : [],
        keywords: keywordTokens,
        suggestionCount: suggestions.length,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        response: responseText,
        logId: newLog._id,
        suggestions,
      },
    });
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    if (error?.message?.includes("GEMINI_API_KEY")) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured",
      });
    }
    res.status(500).json({ message: "Server error while chatting" });
  }
};

export const getMyChatHistory = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const logs = await ChatbotLog.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Error in getMyChatHistory:", error);
    res.status(500).json({ message: "Server error while fetching chat history" });
  }
};

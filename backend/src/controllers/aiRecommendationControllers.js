import AIRecommendation from '../models/AIRecommendation.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateGeminiRecommendations } from '../services/gemini.js';
import { logAIBehavior } from '../services/aiBehavior.js';

const DEFAULT_LIMIT = 6;
const MAX_CANDIDATES = 50;

const clampScore = (value) => Math.max(0, Math.min(1, value));

const extractJsonArray = (text) => {
    if (!text) return null;
    let jsonText = text.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
        jsonText = fenceMatch[1].trim();
    }
    const start = jsonText.indexOf('[');
    const end = jsonText.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) {
        return null;
    }
    jsonText = jsonText.slice(start, end + 1);
    return JSON.parse(jsonText);
};

const normalizeRecommendations = (items, allowedIds, limit) => {
    if (!Array.isArray(items)) return [];
    const results = [];
    const seen = new Set();
    for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const productId = String(
            item.productId || item.product_id || item.id || ''
        ).trim();
        if (!allowedIds.has(productId) || seen.has(productId)) {
            continue;
        }
        const rawScore = Number(item.score);
        const score = Number.isFinite(rawScore) ? clampScore(rawScore) : 0.7;
        results.push({ productId, score });
        seen.add(productId);
        if (results.length >= limit) break;
    }
    return results;
};

const buildFallbackRecommendations = (products, limit) => {
    const sorted = [...products].sort((a, b) => {
        const ratingDiff = (b.averageRating ?? 0) - (a.averageRating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.stock ?? 0) - (a.stock ?? 0);
    });
    return sorted.slice(0, limit).map((product, index) => {
        const ratingScore = clampScore((product.averageRating ?? 0) / 5);
        return {
            productId: product._id.toString(),
            score: ratingScore > 0 ? ratingScore : clampScore(1 - index * 0.05),
        };
    });
};

export const getAllRecommendations = async (req, res) => {
    try {
        const recommendations = await AIRecommendation.find().sort({ createdAt: -1 });
        res.status(200).json(recommendations);
    } catch (error) {
        console.error("Error in getAllRecommendations:", error);
        res.status(500).json({ message: "Server error while fetching recommendations" });
    }
};

export const getRecommendationById = async (req, res) => {
    try {
        const recommendation = await AIRecommendation.findById(req.params.id);
        if (!recommendation) {
            return res.status(404).json({ message: "Recommendation not found" });
        }
        res.status(200).json(recommendation);
    } catch (error) {
        console.error("Error in getRecommendationById:", error);
        res.status(500).json({ message: "Server error while fetching recommendation" });
    }
};

export const createRecommendation = async (req, res) => {
    try {
        const { user, product, score } = req.body;
        const recommendation = new AIRecommendation({ user, product, score });
        const newRecommendation = await recommendation.save();
        res.status(201).json(newRecommendation);
    } catch (error) {
        console.error("Error in createRecommendation:", error);
        res.status(500).json({ message: "Server error while creating recommendation" });
    }
};

export const updateRecommendation = async (req, res) => {
    try {
        const { user, product, score } = req.body;
        const updatedRecommendation = await AIRecommendation.findByIdAndUpdate(
            req.params.id,
            { user, product, score },
            { new: true }
        );
        if (!updatedRecommendation) {
            return res.status(404).json({ message: "Recommendation not found" });
        }
        res.status(200).json(updatedRecommendation);
    } catch (error) {
        console.error("Error in updateRecommendation:", error);
        res.status(500).json({ message: "Server error while updating recommendation" });
    }
};

export const deleteRecommendation = async (req, res) => {
    try {
        const deletedRecommendation = await AIRecommendation.findByIdAndDelete(req.params.id);
        if (!deletedRecommendation) {
            return res.status(404).json({ message: "Recommendation not found" });
        }
        res.status(200).json(deletedRecommendation);
    } catch (error) {
        console.error("Error in deleteRecommendation:", error);
        res.status(500).json({ message: "Server error while deleting recommendation" });
    }
};

export const generateRecommendations = async (req, res) => {
    try {
        const { userId, prompt, limit, candidateProductIds } = req.body || {};
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const requesterId = req.userId;
        const targetUserId = userId || requesterId;

        if (userId && String(userId) !== String(requesterId)) {
            const requester = await User.findById(requesterId).select("role");
            if (!requester || requester.role !== "admin") {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        const desiredLimit = Math.max(
            1,
            Math.min(Number(limit) || DEFAULT_LIMIT, 20),
        );

        let productQuery = { stock: { $gt: 0 } };
        if (Array.isArray(candidateProductIds) && candidateProductIds.length > 0) {
            productQuery = { _id: { $in: candidateProductIds } };
        }

        const products = await Product.find(productQuery)
            .populate("category", "name")
            .sort({ averageRating: -1, createdAt: -1 })
            .limit(MAX_CANDIDATES);

        if (!products.length) {
            return res.status(200).json({
                success: true,
                data: {
                    userId: targetUserId,
                    recommendations: [],
                    source: "empty",
                },
            });
        }

        const allowedIds = new Set(products.map((product) => product._id.toString()));
        const productById = new Map(
            products.map((product) => [product._id.toString(), product]),
        );

        let source = "gemini";
        let recommendations = [];

        try {
            const rawText = await generateGeminiRecommendations({
                prompt,
                products,
                limit: desiredLimit,
            });
            const parsed = extractJsonArray(rawText);
            recommendations = normalizeRecommendations(parsed, allowedIds, desiredLimit);
        } catch (error) {
            if (error?.message?.includes("GEMINI_API_KEY")) {
                return res.status(500).json({
                    success: false,
                    message: "GEMINI_API_KEY is not configured",
                });
            }
            console.warn("Gemini error, falling back to default ranking:", error);
        }

        if (recommendations.length === 0) {
            source = "fallback";
            recommendations = buildFallbackRecommendations(products, desiredLimit);
        }

        if (recommendations.length < desiredLimit) {
            const fallback = buildFallbackRecommendations(products, desiredLimit);
            const seen = new Set(recommendations.map((item) => item.productId));
            for (const item of fallback) {
                if (!seen.has(item.productId)) {
                    recommendations.push(item);
                    seen.add(item.productId);
                }
                if (recommendations.length >= desiredLimit) break;
            }
        }

        await AIRecommendation.deleteMany({ user: targetUserId });
        if (recommendations.length > 0) {
            await AIRecommendation.insertMany(
                recommendations.map((item) => ({
                    user: targetUserId,
                    product: item.productId,
                    score: item.score,
                })),
            );
        }

        const enriched = recommendations
            .map((item) => ({
                product: productById.get(item.productId),
                score: item.score,
            }))
            .filter((item) => item.product);

        const recommendationIds = recommendations.map((item) =>
            String(item.productId),
        );

        logAIBehavior({
            user: targetUserId,
            flow: 'recommendation',
            action: 'generate',
            message: prompt ? String(prompt).trim() : undefined,
            productIds: recommendationIds,
            metadata: {
                source,
                limit: desiredLimit,
                candidateProductIds: Array.isArray(candidateProductIds)
                    ? candidateProductIds.map((id) => String(id))
                    : [],
                requestedBy: String(requesterId),
            },
        });

        res.status(200).json({
            success: true,
            data: {
                userId: targetUserId,
                recommendations: enriched,
                source,
            },
        });
    } catch (error) {
        console.error("Error in generateRecommendations:", error);
        res.status(500).json({ message: "Server error while generating recommendations" });
    }
};

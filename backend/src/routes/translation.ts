import { Router } from "express";
import { translateTextRaw } from "../services/translation";
import Post from "../models/Post";

const router = Router();

// POST /api/translate/text
router.post("/text", async (req, res) => {
  try {
    const { text, target } = req.body as {
      text?: string;
      target?: "ms" | "en";
    };
    if (!text || !target || !["ms", "en"].includes(target)) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const translatedText = await translateTextRaw(text, target);
    return res.json({ translatedText });
  } catch (error) {
    console.error("Translate text error:", error);
    return res.status(500).json({ message: "Error translating text" });
  }
});

// GET /api/translate/posts/:id
router.get("/posts/:id", async (req, res) => {
  try {
    const target = (req.query.target as string) || "ms";
    if (!["ms", "en"].includes(target)) {
      return res.status(400).json({ message: "Invalid target language" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const translatedText = await translateTextRaw(
      post.content,
      target as "ms" | "en",
    );
    return res.json({ translatedText });
  } catch (error) {
    console.error("Translate post error:", error);
    return res.status(500).json({ message: "Error translating post" });
  }
});

export default router;

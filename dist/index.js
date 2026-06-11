import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { contentModel, linkModel, userModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";
const app = express();
// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : [];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, mobile apps)
        if (!origin)
            return callback(null, true);
        // If no allowlist set, allow all (development / initial deploy)
        if (allowedOrigins.length === 0)
            return callback(null, true);
        // Check allowlist
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "authorization"],
}));
app.use(express.json());
// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", message: "SynapseAI backend is running 🧠" });
});
// ── Auth: Signup ──────────────────────────────────────────────────────────────
app.post("/api/v1/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    try {
        const existing = await userModel.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: "Username already exists" });
        }
        await userModel.create({ username, password });
        return res.status(201).json({ message: "User signed up successfully" });
    }
    catch (e) {
        console.error("Signup error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Auth: Signin ──────────────────────────────────────────────────────────────
app.post("/api/v1/signin", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    try {
        const user = await userModel.findOne({ username, password });
        if (!user) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }
        const token = jwt.sign({ id: user._id }, JWT_PASSWORD);
        return res.json({ token });
    }
    catch (e) {
        console.error("Signin error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Content: Create ───────────────────────────────────────────────────────────
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const { title, link, type, note, tags } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const content = await contentModel.create({
            title,
            link: link || "",
            type: type || "link",
            note: note || "",
            tags: Array.isArray(tags) ? tags : [],
            // @ts-ignore
            userId: req.userId,
        });
        return res.status(201).json({ message: "Content Created", content });
    }
    catch (e) {
        console.error("Create content error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Content: Get All ──────────────────────────────────────────────────────────
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const content = await contentModel
            .find({ userId })
            .populate("userId", "username")
            .sort({ createdAt: -1 });
        return res.json({ content });
    }
    catch (e) {
        console.error("Get content error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Content: Delete ───────────────────────────────────────────────────────────
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const { contentId } = req.body;
    if (!contentId) {
        return res.status(400).json({ message: "contentId is required" });
    }
    try {
        // @ts-ignore
        const userId = req.userId;
        const result = await contentModel.deleteOne({ _id: contentId, userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Content not found or unauthorized" });
        }
        return res.json({ message: "Content Deleted" });
    }
    catch (e) {
        console.error("Delete content error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Content: Edit ─────────────────────────────────────────────────────────────
app.put("/api/v1/content/:id", userMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, note, tags } = req.body;
    // @ts-ignore
    const userId = req.userId;
    if (!title)
        return res.status(400).json({ message: "Title is required" });
    try {
        const updated = await contentModel.findOneAndUpdate({ _id: id, userId }, { title, note: note || "", tags: Array.isArray(tags) ? tags : [] }, { new: true });
        if (!updated)
            return res.status(404).json({ message: "Content not found or unauthorized" });
        return res.json({ message: "Content Updated", content: updated });
    }
    catch (e) {
        console.error("Edit content error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Content: Toggle Pin ───────────────────────────────────────────────────────
app.patch("/api/v1/content/:id/pin", userMiddleware, async (req, res) => {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.userId;
    try {
        const item = await contentModel.findOne({ _id: id, userId });
        if (!item)
            return res.status(404).json({ message: "Content not found or unauthorized" });
        item.pinned = !item.pinned;
        await item.save();
        return res.json({ message: "Pin toggled", pinned: item.pinned, content: item });
    }
    catch (e) {
        console.error("Pin content error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── AI: Summarize ─────────────────────────────────────────────────────────────
app.post("/api/v1/ai/summarize", userMiddleware, async (req, res) => {
    const { title, note, link, type } = req.body;
    // If OpenAI key is set, use GPT-4o-mini
    if (process.env.OPENAI_API_KEY) {
        try {
            const prompt = `You are a knowledge assistant. Given the following saved content, write a concise 2-3 sentence summary that captures the key takeaway. Be specific and insightful.

Title: ${title}
Type: ${type || "link"}
URL: ${link || "N/A"}
Existing note: ${note || "none"}

Summary:`;
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 150,
                    temperature: 0.7,
                }),
            });
            const data = await response.json();
            const summary = data?.choices?.[0]?.message?.content?.trim();
            if (summary)
                return res.json({ summary });
        }
        catch (e) {
            console.error("OpenAI error, falling back:", e);
        }
    }
    // ── Smart local fallback (no API key needed) ───────────────────────────────
    const parts = [];
    if (title)
        parts.push(`This is a saved ${type || "link"} titled "${title}".`);
    if (link)
        parts.push(`Source: ${link}.`);
    if (note && note.length > 10) {
        const trimmed = note.length > 200 ? note.slice(0, 200) + "…" : note;
        parts.push(trimmed);
    }
    else {
        parts.push("No additional notes were provided.");
    }
    return res.json({ summary: parts.join(" ") });
});
// ── Brain: Toggle Share ───────────────────────────────────────────────────────
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const { share } = req.body;
    // @ts-ignore
    const userId = req.userId;
    try {
        if (share) {
            // Check if a link already exists for this user
            let link = await linkModel.findOne({ userId });
            if (!link) {
                const hash = crypto.randomBytes(16).toString("hex");
                link = await linkModel.create({ hash, userId });
            }
            return res.json({ hash: link.hash });
        }
        else {
            // Revoke sharing
            await linkModel.deleteOne({ userId });
            return res.json({ message: "Sharing disabled" });
        }
    }
    catch (e) {
        console.error("Share brain error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Brain: Get Shared ─────────────────────────────────────────────────────────
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const { shareLink } = req.params;
    try {
        const link = await linkModel.findOne({ hash: shareLink }).populate("userId", "username");
        if (!link) {
            return res.status(404).json({ message: "Shared brain not found" });
        }
        const content = await contentModel
            .find({ userId: link.userId })
            .sort({ createdAt: -1 });
        const owner = link.userId;
        return res.json({
            username: owner?.username || "Unknown",
            content,
        });
    }
    catch (e) {
        console.error("Get shared brain error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(3000, () => {
    console.log("🚀 SynapseAI server running on http://localhost:3000");
});
//# sourceMappingURL=index.js.map
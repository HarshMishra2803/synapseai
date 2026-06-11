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
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin)
            return callback(null, true);
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
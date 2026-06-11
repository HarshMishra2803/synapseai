import mongoose from "mongoose";
import { model, Schema } from "mongoose";
import "dotenv/config";
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
    console.log("✅ MongoDB Connected");
})
    .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
});
// ── User ────────────────────────────────────────────────────────────────────
const userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
}, { timestamps: true });
export const userModel = model("User", userSchema);
// ── Content ──────────────────────────────────────────────────────────────────
const contentSchema = new Schema({
    title: { type: String, required: true },
    link: { type: String, default: "" },
    type: {
        type: String,
        enum: ["tweet", "youtube", "document", "link", "note"],
        default: "link",
    },
    note: { type: String, default: "" },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
export const contentModel = model("Content", contentSchema);
// ── Link (brain sharing) ─────────────────────────────────────────────────────
const linkSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
export const linkModel = model("Link", linkSchema);
//# sourceMappingURL=db.js.map
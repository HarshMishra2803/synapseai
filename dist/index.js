import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import express from "express";
import { contentModel, userModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";
const app = express();
app.use(express.json());
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({
            username: username
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }
        // Create user
        await userModel.create({
            username: username,
            password: password
        });
        return res.status(201).json({
            message: "User signed up successfully"
        });
    }
    catch (e) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const existingUser = await userModel.findOne({
            username,
            password
        });
        if (existingUser) {
            const token = jwt.sign({
                id: existingUser._id
            }, JWT_PASSWORD);
            res.json({
                token
            });
        }
        else {
            res.status(404).json({
                message: "Incorrect Credientials"
            });
        }
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const title = req.body.title;
    await contentModel.create({
        link,
        title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
    return res.json({
        message: "Content Created"
    });
});
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await contentModel.find({
        userId: userId
    }).populate("userId", "username");
    return res.json({
        content
    });
});
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;
    await contentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    });
    return res.json({
        message: "Content Deleted"
    });
});
app.post("/api/v1/brain/share", (req, res) => {
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
//# sourceMappingURL=index.js.map
import mongoose from "mongoose";
import { model, Schema } from "mongoose";
import { ref } from "node:process";
import "dotenv/config";
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
    console.log("MongoDB Connected");
})
    .catch((err) => {
    console.log(err);
});
const userSchema = new Schema({
    username: { type: String,
        unique: true,
        required: true
    },
    password: { type: String,
        required: true
    },
});
export const userModel = model("User", userSchema);
const contentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
    },
    tags: [{
            type: mongoose.Types.ObjectId, ref: "Tag"
        }],
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
});
export const contentModel = model("Content", contentSchema);
//# sourceMappingURL=db.js.map
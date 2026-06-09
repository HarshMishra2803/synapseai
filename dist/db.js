// mongodb+srv://harshmishra2803_db_user:harsh123@synapseai.uuormsx.mongodb.net/
import mongoose from "mongoose";
import { model, Schema } from "mongoose";
import { ref } from "node:process";
mongoose.connect("mongodb+srv://harshmishra2803_db_user:harsh123@synapseai.uuormsx.mongodb.net/");
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
import mongoose from "mongoose";
import "dotenv/config";
export declare const userModel: mongoose.Model<{
    username: string;
    password: string;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    username: string;
    password: string;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    username: string;
    password: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    username: string;
    password: string;
}, mongoose.Document<unknown, {}, {
    username: string;
    password: string;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    username: string;
    password: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    username: string;
    password: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    username: string;
    password: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const contentModel: mongoose.Model<{
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
}, mongoose.Document<unknown, {}, {
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    title: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    link?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=db.d.ts.map
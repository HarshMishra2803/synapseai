import type { NextFunction } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";


export const userMiddleware = (
    req: Request, res: Response,
    next: NextFunction)=>{
        
        const Header = req.headers["authorization"];
        const decoded = jwt.verify(Header as string , JWT_PASSWORD)

        if(decoded){
            //@ts-ignore
            req.userId = decoded.id;
            next()
        }
        else{
            res.status(401).json({
                message:"Unauthorized"
            })
        }

    }

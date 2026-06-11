import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(header, JWT_PASSWORD) as { id: string };
    if (decoded?.id) {
      // @ts-ignore
      req.userId = decoded.id;
      next();
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized – token expired or invalid" });
  }
};

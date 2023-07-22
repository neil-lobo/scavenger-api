import { NextFunction, Request, Response } from "express";
import { UNAUTHORIZED } from "../http-status.js";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { logger } from "../loggings.js";

const User = z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    confirmedEmail: z.boolean(),
});

export type User = z.infer<typeof User>;

export interface AuthedRequest extends Request {
    auth?: {
        token: string;
        user: User;
    };
}

export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({
            ...UNAUTHORIZED,
        });
    }

    token = token.slice(7);
    const data = jwt.verify(token, config.jwt.secret);

    let user: User;
    try {
        user = User.parse(data);
    } catch (err) {
        logger.error("JWTPayload", (err as Error).message);
        return res.status(400).send();
    }

    req.auth = {
        token,
        user,
    };

    next();
}

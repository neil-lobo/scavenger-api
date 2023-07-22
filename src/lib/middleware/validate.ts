import { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { BAD_REQUEST } from "../http-status.js";

export function validateBody(schema: z.ZodObject<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
        } catch (err) {
            const errors = err as ZodError;
            return res.status(400).json({
                ...BAD_REQUEST,
                errors,
            });
        }

        next();
    };
}

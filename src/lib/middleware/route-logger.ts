import { NextFunction, Request, Response } from "express";
import { logger } from "../loggings.js";

export function logRoute(req: Request, res: Response, next: NextFunction) {
    let path = req.path;
    if (!path.endsWith("/")) path += "/";
    logger.debug("API", `${req.method} ${path}`);
    next();
}

import { NextFunction, Request, Response } from "express";
import chalk from "chalk";

export function logRoute(req: Request, res: Response, next: NextFunction) {
    let path = req.path;
    if (!path.endsWith("/")) path += "/";
    console.log(chalk.red("[API]"), chalk.green(req.method, path));
    next();
}

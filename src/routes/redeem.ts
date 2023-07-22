import { Request, Response, Router, json } from "express";
import { BAD_REQUEST } from "../lib/http-status.js";
import { logRoute } from "../lib/middleware/route-logger.js";

const router = Router();

const middleware = [json(), logRoute];

router.post("/redeem", middleware, (req: Request, res: Response) => {
    if (req.body.code === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing `code` field",
        });
    }

    res.send(req.body.code);
});

export { router as redeem };

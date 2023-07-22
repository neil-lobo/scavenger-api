import { Response, Router, json } from "express";
import { BAD_REQUEST } from "../lib/http-status.js";
import { logRoute } from "../lib/middleware/route-logger.js";
import { AuthedRequest, auth } from "../lib/middleware/auths.js";

const router = Router();

const middleware = [auth, json(), logRoute];

router.post("/redeem", middleware, (req: AuthedRequest, res: Response) => {
    if (req.body.code === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing `code` field",
        });
    }

    res.send({
        code: req.body.code,
        auth: req.auth,
    });
});

export { router as redeem };

import { Response, Router, json } from "express";
import { BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../lib/http-status.js";
import { logRoute } from "../lib/middleware/route-logger.js";
import { AuthedRequest, auth } from "../lib/middleware/auths.js";
import { db } from "../lib/db.js";
import { logger } from "../index.js";

const router = Router();

const middleware = [auth, json(), logRoute];

router.post("/redeem", middleware, async (req: AuthedRequest, res: Response) => {
    const code: string = req.body.code;
    if (code === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing `code` field",
        });
    }

    let rows: any[];
    try {
        rows = await db.pool.query("SELECT * FROM MAC_SH_DEV.CODES WHERE CODE = ? AND ACTIVE = 1", [code.toLowerCase()]);
    } catch(err) {
        logger.error("CheckCode", (err as Error).message);
        return res.status(500).json({
            ...INTERNAL_SERVER_ERROR,
        });
    }

    if (rows.length === 0) {
        return res.status(404).json({
            ...NOT_FOUND,
            message: "Code not found or inactive!",
        });
    }

    try {
        const nowEpoch = Math.floor(Date.now() / 1000);
        const res = await db.pool.query("INSERT INTO MAC_SH_DEV.REDEEMS (CODE, `TIME`, UID) VALUES(?, ?, ?)", [code.toLowerCase(), nowEpoch, req.auth?.user.id]);
        logger.debug("InsertRedeem", "", res);
    } catch(err: any) {
        logger.error("InsertRedeem", err.message);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(403).json({
                ...FORBIDDEN,
                message: "User has already redeemed this code!"
            })
        } else {
            return res.status(500).json({
                ...INTERNAL_SERVER_ERROR,
            });
        }
    }

    res.status(200).send();
});

export { router as redeem };

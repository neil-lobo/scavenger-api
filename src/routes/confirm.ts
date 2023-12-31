import { Request, Response, Router, json } from "express";
import { db } from "../lib/db.js";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../lib/http-status.js";
import * as assert from "node:assert";
import { logRoute } from "../lib/middleware/route-logger.js";
import { sendPostConfirmationEmail } from "../lib/mail.js";
import { z } from "zod";
import { validateBody } from "../lib/middleware/validate.js";
import { logger } from "../index.js";
const router = Router();

const bodySchema = z.object({
    code: z.string(),
});

const middlware = [logRoute, json(), validateBody(bodySchema)];

router.post("/confirm", middlware, async (req: Request, res: Response) => {
    let data;
    try {
        data = await db.pool.query(
            "SELECT * FROM MAC_SH_DEV.USERS WHERE CONFIRMATION_CODE = ?",
            [req.body.code]
        );
    } catch (err: any) {
        logger.error("ConfirmEmailCode", (err as Error).message);
        return res.status(500).json(INTERNAL_SERVER_ERROR);
    }

    if (data.length === 0) {
        return res.status(404).json({
            ...NOT_FOUND,
            message: "Invalid confirmation code",
        });
    }
    assert.notEqual(data[0].ID, undefined);
    try {
        await db.pool.query(
            "UPDATE MAC_SH_DEV.USERS SET EMAIL_CONFIRMED=1, CONFIRMATION_CODE=NULL WHERE ID=?",
            [data[0].ID]
        );
    } catch (err: any) {
        logger.error("AcceptConfirmEmailCode", (err as Error).message);
        return res.status(500).json(INTERNAL_SERVER_ERROR);
    }

    try {
        await sendPostConfirmationEmail(data[0].EMAIL);
    } catch (err: any) {
        logger.error("SendPostConfirmEmail", (err as Error).message);
    }

    res.send({
        message: "Confirmed email!",
    });
});

export { router as confirm };

import { Request, Response, Router, json } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../lib/http-status.js";
import { logRoute } from "../lib/middleware/route-logger.js";
import { db } from "../lib/db.js";
import { randomBytes } from "crypto";
import { sendConfirmationEmail } from "../lib/mail.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import { validateBody } from "../lib/middleware/validate.js";

const router = Router();
// const passwordExpr = /^[\w!@#$%^&*() ]+$/;

const bodySchema = z.object({
    email: z.string().max(256).email(),
    // password: z.string().min(8).max(32).regex(passwordExpr),
    password: z.string().min(8).max(32),
    name: z.object({
        first: z.string().min(1).max(50),
        last: z.string().min(1).max(50),
        abbrevLast: z.boolean(),
    }),
});

const middleware = [logRoute, json(), validateBody(bodySchema)];

router.post("/signup", middleware, async (req: Request, res: Response) => {
    const code = randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    try {
        await db.pool.query(
            "INSERT INTO MAC_SH_DEV.USERS (EMAIL, PASSWORD, F_NAME, L_NAME, EMAIL_CONFIRMED, CONFIRMATION_CODE, L_NAME_INITIALIZE) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                req.body.email.toLowerCase(),
                passwordHash,
                req.body.name.first.toLowerCase(),
                req.body.name.last.toLowerCase(),
                false,
                code,
                req.body.name.abbrevLast,
            ]
        );
    } catch (err: any) {
        console.log(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                ...BAD_REQUEST,
                message: "Email is already in use",
            });
        } else {
            return res.status(500).json({
                ...INTERNAL_SERVER_ERROR,
            });
        }
    }

    try {
        await sendConfirmationEmail(req.body.email.toLowerCase(), code);
    } catch (err: any) {
        console.log(err);
    }

    res.status(200).send();
});

export { router as signup };

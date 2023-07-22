import { NextFunction, Request, Response, Router, json } from "express";
import { db } from "../lib/db.js";
import {
    BAD_REQUEST,
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    UNAUTHORIZED,
} from "../lib/http-status.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../lib/config.js";

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    if (email === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'email' field",
        });
    }

    if (password === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'password' field",
        });
    }

    next();
};

const middleware = [json(), validate];

router.post("/login", middleware, async (req: Request, res: Response) => {
    let user;
    let token;

    try {
        const row = await db.pool.query(
            "SELECT ID,EMAIL,F_NAME,L_NAME,EMAIL_CONFIRMED,PASSWORD FROM MAC_SH_DEV.USERS WHERE EMAIL = ?",
            [req.body.email]
        );

        // email not found in db
        if (row.length === 0) {
            return res.status(404).json({
                ...NOT_FOUND,
                message: "No account with that email exists!",
            });
        }

        user = row[0];

        const hash = row[0].PASSWORD;
        const compare = await bcrypt.compare(req.body.password, hash);
        delete user.PASSWORD;

        if (!compare) {
            return res.status(401).json({
                ...UNAUTHORIZED,
                message: "Incorrect password",
            });
        }
    } catch (err: any) {
        console.log(err);
        return res.status(500).json({
            ...INTERNAL_SERVER_ERROR,
        });
    }

    if (!user.EMAIL_CONFIRMED) {
        return res.status(403).json({
            ...FORBIDDEN,
            message: "Email not confirmed",
        });
    }

    // create jwt
    try {
        token = jwt.sign(user, config.jwt.secret);
    } catch (err: any) {
        console.log(err);
        return res.status(500).json({
            ...INTERNAL_SERVER_ERROR,
        });
    }

    res.json({
        token,
        user,
    });
});

export { router as login };

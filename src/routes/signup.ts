import { NextFunction, Request, Response, Router, json } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../lib/http-status.js";
import { logRoute } from "../lib/middleware/route-logger.js";
import { db } from "../lib/db.js";
import { randomBytes } from "crypto";
import { sendConfirmationEmail } from "../lib/mail.js";
import bcrypt from "bcrypt";

const router = Router();
const emailExpr = /^.+@mcmaster\.ca$/;
const passwordExpr = /^[\w!@#$%^&*() ]+$/;

const validate = (req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const fName: string = req.body.name?.first;
    const lName: string = req.body.name?.last;
    const lNameAbbrev: boolean = req.body.name?.abbrevLast;

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

    if (fName === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'name.first' field",
        });
    }

    if (lName === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'name.last' field",
        });
    }

    if (lNameAbbrev === undefined) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'name.abbrevLast' field",
        });
    }

    /*
        Email asserts:
            - no spaces
            - max 256 chars
            - match regex
    */
    if (
        email.length > 256 ||
        email.search(" ") !== -1 ||
        !emailExpr.test(email)
    ) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Invalid email",
        });
    }

    /*
        Password asserts:
            - minimum 8 chars
            - max 32 chars
            - match regex
    */
    if (
        password.length < 8 ||
        password.length > 32 ||
        !passwordExpr.test(password)
    ) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Invalid password",
        });
    }

    //TODO asserts for other fields
    // also maybe make own custom schema validator that returns HTTP response

    next();
};

const middleware = [logRoute, json(), validate];

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

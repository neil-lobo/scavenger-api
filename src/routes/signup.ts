import { Router, json } from "express";
import { BAD_REQUEST } from "../lib/http-status.js";
import { routeLog } from "../lib/middleware/route-logger.js";

const router = Router();
const emailExpr = /^.+@mcmaster\.ca$/;
const passwordExpr = /^[\w!@#$%^&*() ]+$/;

router.use(json());
router.use(routeLog);
router.use((req, res, next) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    if (!email) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'email' field"
        });
    }

    if (!password) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Missing 'password' field"
        });
    }

    /*
        Email asserts:
            - no spaces
            - max 256 chars
            - match regex
    */
   if (email.length > 256 || email.search(" ") !== -1 || !emailExpr.test(email)) {
       return res.status(400).json({
           ...BAD_REQUEST,
           message: "Invalid email"
        });
    }
    
    /*
        Password asserts:
            - minimum 8 chars
            - max 32 chars
            - match regex
    */
    if (password.length < 8 || password.length > 32 || !passwordExpr.test(password)) {
        return res.status(400).json({
            ...BAD_REQUEST,
            message: "Invalid password"
        });
    }

    next();
});

router.post("/signup", (req, res) => {
    res.status(200).send();
});

export { router as signup };
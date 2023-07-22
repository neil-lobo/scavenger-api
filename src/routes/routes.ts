import { Router } from "express";
import { signup } from "./signup.js";
import { confirm } from "./confirm.js";
import { login } from "./login.js";
import { redeem } from "./redeem.js";

export const routes = Router();

routes.use(signup);
routes.use(confirm);
routes.use(login);
routes.use(redeem);

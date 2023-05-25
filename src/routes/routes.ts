import { Router } from "express";
import { signup } from "./signup.js";
import { confirm } from "./confirm.js";

export const routes = Router();

routes.use(signup);
routes.use(confirm);

if (process.env.DOTENV) {
    (await import("dotenv")).config();
}

import chalk from "chalk";
import express from "express";
import { routes } from "./routes/routes.js";
import cors from "cors"

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors())
app.use(routes);

app.listen(PORT, async () => {
    console.log(
        chalk.red("[API]"),
        `Listening on ${process.env.URL ?? "http://localhost"}:${PORT}`
    );
});

if (process.env.DOTENV) {
    (await import("dotenv")).config();
}

import express from "express";
import { routes } from "./routes/routes.js";
import cors from "cors";
import { logger } from "./lib/loggings.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(routes);

app.listen(PORT, async () => {
    logger.info(
        "API",
        `Listening on ${process.env.URL ?? "http://localhost"}:${PORT}`
    );
});

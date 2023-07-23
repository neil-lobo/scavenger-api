import { loadEnv } from "./lib/env.js";
import express from "express";
import { routes } from "./routes/routes.js";
import cors from "cors";
import { Logger, Level as LogLevel } from "./lib/loggings.js";

await loadEnv();
export const logger = new Logger(
    Number(process.env.LOG_LEVEL ?? LogLevel.INFO) as LogLevel
);

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

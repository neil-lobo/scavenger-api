if (process.env.DOTENV) {
    (await import("dotenv")).config()
}

import { createRequire } from 'node:module';
import chalk from 'chalk'
import express from 'express';
import { routes } from './routes/routes.js';
import db from 'mariadb';

const app = express();
const PORT = process.env.PORT ?? 3000;
const require = createRequire(import.meta.url);
const config = require("../config.json")

console.log(config);

const pool = db.createPool({
    ...config.db
})

app.use(routes);

app.listen(PORT, async () => {
    console.log(chalk.red("[API]"), `Listening on ${process.env.URL}:${PORT}`);
})
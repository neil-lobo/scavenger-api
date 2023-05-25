import { createRequire } from 'node:module';
import db from 'mariadb';

const require = createRequire(import.meta.url);
const config = require("../config.json");

class DB {
    pool;

    constructor() {
        this.pool = db.createPool({
            ...config.db
        });
    }
}

const instance = new DB();

export { instance as db };
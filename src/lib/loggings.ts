import chalk from "chalk";

export enum Level {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

export class Logger {
    private level: Level;

    constructor(initLevel: Level = Level.INFO) {
        this.level = initLevel;
        this.info("Logger", `Log Level: ${Level[this.level]}`);
    }

    setLevel(level: Level) {
        this.level = level;
    }

    private log(text: string, object?: object) {
        console.log(chalk.yellow(new Date().toLocaleString()), text);
        if (object) {
            console.log(object);
        }
    }

    error(label: string, text: string, object?: object) {
        if (this.level >= Level.ERROR) {
            this.log(
                `${chalk.bgRed.bold("[ERROR]")}` +
                    chalk.green(` <${label}> `) +
                    `${text}`,
                object
            );
        }
    }

    warn(label: string, text: string, object?: object) {
        if (this.level >= Level.WARN) {
            this.log(
                `${chalk.bgYellow.bold("[WARN]")}` +
                    chalk.green(` <${label}> `) +
                    `${text}`,
                object
            );
        }
    }

    info(label: string, text: string, object?: object) {
        if (this.level >= Level.INFO) {
            this.log(
                `${chalk.bgBlue.bold("[INFO]")}` +
                    chalk.green(` <${label}> `) +
                    `${text}`,
                object
            );
        }
    }

    debug(label: string, text: string, object?: object) {
        if (this.level >= Level.DEBUG) {
            this.log(
                `${chalk.bgMagenta.bold("[DEBUG]")}` +
                    chalk.green(` <${label}> `) +
                    `${text}`,
                object
            );
        }
    }
}

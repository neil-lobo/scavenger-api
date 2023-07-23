export async function loadEnv() {
    if (process.env.DOTENV) {
        (await import("dotenv")).config();
    }
}

import * as sg from "@sendgrid/mail";
import { config } from "./config.js";
import * as assert from "node:assert";

const mail = sg.default;
assert.notEqual(config.sg?.apiKey, undefined, "Missing SendGrid API key!");
assert.notEqual(config.sg?.sender, undefined, "Missing SendGrid sender email!");
mail.setApiKey(config.sg.apiKey);

export async function sendConfirmationEmail(to: string, code: string) {
    return mail.send({
        from: config.sg.sender,
        to,
        subject: "Scavenger Account Confirmation",
        text: `Verify account: http://localhost:3000/confirm?code=${code}\nCode: ${code}`, // FIXME load domain from config
    });
}

export async function sendPostConfirmationEmail(to: string) {
    return mail.send({
        from: config.sg.sender,
        to,
        subject: "Scavenger Account Creation!",
        text: `Thanks for verfying your account! Have fun!`,
    });
}

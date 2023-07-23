import { EventEmitter } from "node:events";
import { User } from "./middleware/auths.js";

export const events = new EventEmitter();

export type CodeRedeemEvent = {
    code: string;
    user: User;
};

import { EventEmitter } from "events";

class AppEventEmitter extends EventEmitter {}

export const appEmitter = new AppEventEmitter();

export const EVENTS = {
  EMAIL: {
    SIGNUP: "email:signup",
    INVITE: "email:invite",
  },
};

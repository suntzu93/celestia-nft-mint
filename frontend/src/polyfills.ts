import { Buffer } from "buffer";

window.global = window.global ?? window;
// @ts-ignore
window.Buffer = window.Buffer ?? Buffer;

export {};

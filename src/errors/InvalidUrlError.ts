import { AppError } from "./AppError.js";

export class InvalidUrlError extends AppError {
    constructor() {
        super("Invalid URL provided", 400);
    }
};
import { AppError } from "./AppError.js";

export class UrlNotFoundError extends AppError {
    constructor() {
        super("Short URL not found", 404)
    };
};
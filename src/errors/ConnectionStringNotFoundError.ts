import { AppError } from "./AppError.js";

export class ConnectionStringNotFoundError extends AppError {
    constructor() {
        super("Database connection string not found", 404);
    }
};
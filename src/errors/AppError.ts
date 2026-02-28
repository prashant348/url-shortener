
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, stausCode: number) {
        super(message);

        this.statusCode = stausCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    };
};
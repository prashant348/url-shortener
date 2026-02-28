import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT: Number(process.env.PORT) || 5000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    NODE_ENV: process.env.NODE_ENV || "development",
    BASE_URL: process.env.BASE_URL || "http://localhost:5000",
    FORCE_EXIT_TIMEOUT: Number(process.env.FORCE_EXIT_TIMEOUT) || 15,
}
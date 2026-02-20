import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// health check route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Server is up and running"
    })
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


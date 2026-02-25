import express from "express";
import type { NextFunction, Request, Response } from "express";
import { db } from "./db/db.js";
import { ss } from "./services/shutdown.service.js";
import { ENV } from "./config/env.js";

const app = express();
const PORT = ENV.PORT;

app.use((req: Request, res: Response, next: NextFunction) => {
    ss.monitorRequests(req, res, next);
});

// health check route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Server is up and running"
    })
});

// slow route
app.get("/slow", async (req, res) => {
    await new Promise(r => setTimeout(r, 10000));
    res.send("DONE");
});

app.get("/slower", async (req, res) => {
    await new Promise(r => setTimeout(r, 15000));
    res.send("DONE");
});

app.get("/slowest", async (req, res) => {
    await new Promise(r => setTimeout(r, 20000));
    res.send("DONE");
});

app.get("/disconnect", async (req, res) => {
    const prisma = db.getClient();
    await prisma.$disconnect();
    console.log("db disconnected");
    await db.getClient().$queryRaw`SELECT 1`;
    console.log("db connected back!");
    res.send("DONE");
})

// Start server
const server = app.listen(PORT, async () => {
    await db.connect().catch((err) => {
        console.error("Error connecting to database", err);
        process.exit(1);
    });
    console.log(`Server is running on http://localhost:${PORT}`);
});

const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
    process.on(signal, () => ss.gracefulShutdown(signal, server));
}); 

import express from "express";
import type { NextFunction, Request, Response } from "express";
import { db } from "./db/db.js";
import { ss } from "./services/shutdown.service.js";
import { ENV } from "./config/env.js";
import UrlRouter from "./routes/url.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export const app = express();
const PORT = ENV.PORT;

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
    ss.monitorRequests(req, res, next);
});
app.use("/", UrlRouter);
app.use(errorHandler);

// health check route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Server is up and running"
    })
});


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


process.on("uncaughtException", async (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err);

  await db.disconnect("Shutdown due to uncaught exception!");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(reason);
  process.exit(1);
});

import { Server, IncomingMessage, ServerResponse } from "http";
import type { Request, Response, NextFunction } from "express";
import { db } from "../db/db.js";
import type { IShutdownService } from "../types/shutdown.service.type.js";
import { ENV } from "../config/env.js";


export class ShutdownService implements IShutdownService {

    private _isShuttingDown: boolean = false;
    private _activeRequests: number = 0;
    private _isCleaningUp: boolean = false;
    private readonly timeout = ENV.FORCE_EXIT_TIMEOUT;

    public get isShuttingDown(): boolean {
        return this._isShuttingDown;
    }

    public monitorRequests(req: Request, res: Response, next: NextFunction): void {
        // manually block new requests immediately while shutting down
        if (this._isShuttingDown) {
            console.log("new req rejected while shutting down");
            res.status(503).set("Connection", "close").json({
                error: "Server is shutting down",
                message: "Try again later",
            });
            return; // STOP HERE - do not call next();
        };

        this._activeRequests++;
        console.log("active reqs: ", this._activeRequests);

        res.on("finish", () => {
            console.log("req finished");
            this._activeRequests--;
            console.log("active reqs: ", this._activeRequests);
            if (this._isShuttingDown && this._activeRequests === 0) {
                process.emit("CLEANUP_READY"); // Custom signal to trigger final cleanup
            };
        });

        next();
    };

    private startForceExit(
        seconds: number
    ): NodeJS.Timeout {
        return setTimeout(async () => {
            console.error("GRACEFUL SHUTDOWN TIMEOUT: Force exited process.");
            process.exit(1);
        }, seconds * 1000);
    };

    public async gracefulShutdown(
        signal: NodeJS.Signals,
        server: Server<typeof IncomingMessage, typeof ServerResponse>,
    ): Promise<void> {
        if (this._isShuttingDown) return; // prevent double trigger
        this._isShuttingDown = true;
        const forceExitTimeout = this.startForceExit(this.timeout);

        console.log(`GRACEFUL SHUTDOWN: Received ${signal} signal. Shutting down...`);

        // 1. STOP ACCEPTING NEW CONNECTIONS
        server.close();

        // 2. Tell browsers to close connections after their current request
        // This stops "Keep-Alive" from hanging the process
        if (typeof server.closeIdleConnections === 'function') {
            server.closeIdleConnections();
        }

        const performCleanup = async () => {
            if (this._isCleaningUp) return;
            this._isCleaningUp = true;
            if (forceExitTimeout) clearTimeout(forceExitTimeout);
            console.log("All requests finished. Cleaning up...");
            await db.disconnect("Shutdown gracefully!");
            process.exit(0);
        }

        if (this._activeRequests === 0) {
            await performCleanup();
        } else {
            console.log(`Waiting for ${this._activeRequests} requests to finish...`);  
            process.once("CLEANUP_READY", performCleanup);
        };

        // Safety net: If something hangs for 15s, just kill it
        // const forceExitTimeout = this.startForceExit(this.timeout);
    }

}

export const ss = new ShutdownService();
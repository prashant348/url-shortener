import { Server, IncomingMessage, ServerResponse } from "http";
import type { NextFunction, Request, Response } from "express";

export interface IShutdownService {
    readonly isShuttingDown: boolean;
    monitorRequests(req: Request, res: Response, next: NextFunction): void;
    gracefulShutdown(
        signal: NodeJS.Signals,
        server: Server<typeof IncomingMessage, typeof ServerResponse>
    ): Promise<void>;
}
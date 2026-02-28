import type { Response, Request, NextFunction } from "express";

export interface IUrlController {
    create: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<Response | undefined>;
    redirect: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<void | Response>;
}
import { UrlService } from "../services/url.service.js";
import type { NextFunction, Request, Response } from "express";
import type { IUrlController } from "../types/url.controller.type.js";

export class UrlController implements IUrlController {

    constructor(private urlService: UrlService) {}

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    message: "URL is required"
                });
            };

            const shortUrl = await this.urlService.createShortUrl(url);

            return res.status(201).json({
                shortUrl
            });

        } catch (err) {
            next(err);
        };
    };

    public redirect = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> => {
        try {
            const { code } = req.params;

            const shortCode = code as string;

            const originalUrl = await this.urlService.getOriginalUrl(shortCode);

            if (!originalUrl) {
                return res.status(404).json({
                    message: "URL not found"
                });
            };

            return res.status(302).redirect(originalUrl);
        } catch (err) {
            next(err);
        };
    };

};


import type { ShortenedUrlResponse } from "./url.types.js";

export interface IUrlService {
    createShortUrl(originalUrl: string): Promise<ShortenedUrlResponse>;
    getOriginalUrl(shortCode: string): Promise<string>;
}
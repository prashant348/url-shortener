import { UrlRepository } from "../repositories/url.repository.js"
import { generateShortCode } from "../utils/generateCode.js";
import { isValidUrl } from "../utils/validateUrl.js";
import type { IUrlService } from "../types/url.service.type.js";
import type { ShortenedUrlResponse } from "../types/url.types.js";
import { InvalidUrlError } from "../errors/InvalidUrlError.js";
import { UrlNotFoundError } from "../errors/UrlNotFoundError.js";


export class UrlService implements IUrlService {

    constructor(
        private urlRepository: UrlRepository,
        private baseUrl: string
    ) {};

    public async createShortUrl(
        originalUrl: string
    ): Promise<ShortenedUrlResponse> {
        if (!isValidUrl(originalUrl)) {
            throw new InvalidUrlError();
        }

        let shortCode: string;
        let shortCodeAlreadyExist;

        // collison handling
        do {
            shortCode = generateShortCode(6);
            shortCodeAlreadyExist = await this.urlRepository.findByCode(shortCode);
        } while (shortCodeAlreadyExist);

        const url = await this.urlRepository.create(
            originalUrl,
            shortCode
        );

        return {
            id: url.id,
            originalUrl: url.originalUrl,
            shortUrl: `${this.baseUrl}/${shortCode}`,
            createdAt: url.createdAt
        };
    };

    public async getOriginalUrl(
        shortCode: string
    ): Promise<string> {
        const url = await this.urlRepository.findByCode(shortCode);

        if (!url) {
            throw new UrlNotFoundError();
        };

        return url.originalUrl;
    };

}

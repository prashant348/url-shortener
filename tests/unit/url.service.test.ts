import { describe, expect, it, vi } from "vitest";
import { UrlService } from "../../src/services/url.service";
import { InvalidUrlError } from "../../src/errors/InvalidUrlError";
import { UrlRepository } from "../../src/repositories/url.repository";
import { ENV } from "../../src/config/env";
import { UrlNotFoundError } from "../../src/errors/UrlNotFoundError";

describe("Url Service Tests", () => {
    
    it("should throw error for invalid url", async () => {

        const urlRepositoryMock = {
            create: vi.fn(),
            findByCode: vi.fn()
        } as unknown as UrlRepository;

        const urlService = new UrlService(urlRepositoryMock, ENV.BASE_URL);

        await expect(
            urlService.createShortUrl("invalid-url")
        ).rejects.toThrowError(InvalidUrlError);

    });

    it("should retry if code already exists", async () => {
        const mockRepo = {
            create: vi.fn().mockResolvedValue({
                shortCode: "abc123"
            }),
            findByCode: vi
                .fn()
                .mockResolvedValueOnce({ id: 1 }) //first time exists
                .mockResolvedValueOnce(null) //second time doesn't exist
        } as unknown as UrlRepository;

        const urlService = new UrlService(mockRepo, ENV.BASE_URL);

        await urlService.createShortUrl("https://example.com");
        expect(mockRepo.findByCode).toHaveBeenCalledTimes(2);
    });

    it("should return original url from shortCode", async () => {
        const mockRepo = {
            findByCode: vi.fn().mockResolvedValue({ originalUrl: "https://example.com" })
        } as unknown as UrlRepository;

        const urlService = new UrlService(mockRepo, ENV.BASE_URL);

        const result = await urlService.getOriginalUrl("abc123");
        expect(result).toBe("https://example.com");
    });

    it("should throw error if original url not found", async () => {
        const mockRepo = {
            findByCode: vi.fn().mockResolvedValue(null)
        } as unknown as UrlRepository;

        const urlService = new UrlService(mockRepo, ENV.BASE_URL);

        await expect(
            urlService.getOriginalUrl("abc123")
        ).rejects.toThrowError(UrlNotFoundError);
    })
});


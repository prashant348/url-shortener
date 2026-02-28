import { describe, it, expect } from "vitest";
import { generateShortCode } from "../../src/utils/generateCode";
import { isValidUrl } from "../../src/utils/validateUrl";

describe("Url Utils Tests", () => {
    it("should generate short code", () => {
        const code = generateShortCode(8);
        expect(code.length).toBe(8);
    });

    it("should return true if url is valid", () => {
        const url = "https://example.com";
        const result = isValidUrl(url);
        expect(result).toBe(true);
    });

    it("should return false if url is invalid", () => {
        const url = "invalid-url";
        const result = isValidUrl(url);
        expect(result).toBe(false);
    });
});


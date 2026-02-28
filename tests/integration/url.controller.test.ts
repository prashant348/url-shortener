import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/server";
import { db } from "../../src/db/db";
import { ShortenedUrlResponse } from "../../src/types/url.types";

describe("Url Controller Integration Tests", () => {
    beforeAll(async () => {
        await db.connect();
    })

    afterAll(async () => {
        await db.disconnect();
    });

    it("should create a short url successfully", async () => {
        const payload = { url: "https://example.com" };

        const res = await request(app)
            .post("/api/shorten")
            .send(payload)

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("shortUrl");
        expect(res.body.shortUrl).not.toBeNull();
    });

    it("should return 400 if URL is missing in body", async () => {
        const res = await request(app)
            .post("/api/shorten")
            .send({});
        
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toBe("URL is required");
    });
    
    it("should redirect to original url", async () => {
        // test should create its own data
        const createRes = await request(app)
            .post("/api/shorten")
            .send({ url: "https://example.com" });
        
        const shortCode = (createRes.body.shortUrl as ShortenedUrlResponse).shortUrl.split("/").pop();


        const res = await request(app)
            .get(`/${shortCode}`)
        
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("https://example.com");
    })
})


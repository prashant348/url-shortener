import { describe, expect, it, vi } from "vitest";
import { DatabaseService } from "../../src/services/database.service";
import { PrismaClient } from "../../src/generated/prisma/client";

describe('Database connect()', () => {
    it("should change status to connected on successful connection", async () => {

        const fakePrisma = {
            $connect: vi.fn().mockResolvedValue(undefined),
            $disconnect: vi.fn(),
            $queryRaw: vi.fn().mockResolvedValue(1),
        } as unknown as PrismaClient;

        const db = new DatabaseService(fakePrisma);

        await db.connect();

        expect(db.status).toBe("connected");
    });
});

describe("Database disconnect()", async () => {
    it("should call process.exit on disconnect", async () => {
        const fakePrisma = {
            $disconnect: vi.fn().mockResolvedValue(undefined),
        } as unknown as PrismaClient;

        const db = new DatabaseService(fakePrisma);

        await db.disconnect();

        expect(db.status).toBe("disconnected");
    });
});




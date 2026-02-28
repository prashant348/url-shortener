import { PrismaClient } from "../generated/prisma/client.js";
import type { IDatabaseService } from "../types/database.service.type.js";

export class DatabaseService implements IDatabaseService {

    private _status: "connected" | "disconnected" = "disconnected";

    constructor(private prisma: PrismaClient) { }

    public get status(): "connected" | "disconnected" {
        return this._status;
    }

    public getClient(): PrismaClient {
        return this.prisma;
    }

    public async connect(): Promise<void> {
        await this.prisma.$connect();
        await this.prisma.$queryRaw`SELECT 1`; // Simple ping to verify connection
        this._status = "connected";
        console.log("✅ Database connected!");
    }

    public async disconnect(cleanupMessage?: string): Promise<void> {
        await this.prisma.$disconnect();
        this._status = "disconnected";
        console.log("🔌 Database disconnected!");
        console.log(cleanupMessage);
    }
}
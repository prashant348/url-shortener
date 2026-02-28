import { PrismaClient } from "../generated/prisma/client.js";

export interface IDatabaseService {
    readonly status: "connected" | "disconnected";
    getClient(): PrismaClient;
    connect(): Promise<void>;
    disconnect(cleanupMessage?: string): Promise<void>;
}
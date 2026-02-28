import { DatabaseService } from "../services/database.service.js";
import { ENV } from "../config/env.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { ConnectionStringNotFoundError } from "../errors/ConnectionStringNotFoundError.js";

const connectionString = ENV.DATABASE_URL;

if (!connectionString) {
    throw new ConnectionStringNotFoundError();
};

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
    adapter,
    log: ["error", "warn"]
});

export const db = new DatabaseService(prisma);

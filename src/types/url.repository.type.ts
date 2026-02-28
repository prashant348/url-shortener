import type { Url } from "../generated/prisma/client.js";

export interface IUrlRepository {
    create(originalUrl: string, shortCode: string): Promise<Url>;
    findByCode(shortCode: string): Promise<Url | null>;
}
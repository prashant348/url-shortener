import type { PrismaClient } from "../generated/prisma/client.js";
import type { IUrlRepository } from "../types/url.repository.type.js";
import type { Url } from "../generated/prisma/client.js";

export class UrlRepository implements IUrlRepository {

    constructor(private prisma: PrismaClient) {}

    public async create(
        originalUrl: string,
        shortCode: string
    ): Promise<Url> {
        return this.prisma.url.create({
            data: {
                shortCode,
                originalUrl
            }
        });
    };

    public async findByCode(
        shortCode: string
    ): Promise<Url | null> {
        return this.prisma.url.findUnique({
            where: {
                shortCode
            }
        });
    };

};


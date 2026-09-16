import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    const pool = new pg.Pool({ 
        connectionString,
        max: 1, // Vercel (Serverless) ortamı için bağlantı sınırını minimumda tutuyoruz
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

export const db =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// 1. Import Prisma namespace to access the PrismaClientOptions type
import { PrismaClient, Prisma } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService
  // 2. Pass the options type directly into the parent class definition
  extends PrismaClient<Prisma.PrismaClientOptions>
  implements OnModuleInit, OnModuleDestroy
{
  private pool: pg.Pool;

  constructor() {
    const poolInstance = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter: new PrismaPg(poolInstance),
    });

    this.pool = poolInstance;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end(); // Safely closes the connection pool on shutdown
  }
}

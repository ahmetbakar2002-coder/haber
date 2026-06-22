const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.mtztuljudfamlblmqmzo:m5Ksgk7y6Z79A2ih@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function main() {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
  console.log("Extension pg_trgm enabled successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import path from "path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({
  path: path.resolve(__dirname, "../configs/.env"),
});

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://portfolio:portfolio@localhost:5432/portfolio";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL ?? databaseUrl,
  },
});

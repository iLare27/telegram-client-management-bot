/**
 * Database connection setup using TypeORM with PostgreSQL
 */

import "reflect-metadata";
import { DataSource, Repository } from "typeorm";
import { ClientTopic } from "./entity/ClientTopic.js";
import dotenv from "dotenv";

dotenv.config(); // Load DATABASE_URL from .env

// Example DATABASE_URL:
// postgres://user:password@host:port/dbname

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Safe & flexible for deployment
  synchronize: true, // Auto-create tables (disable in production, use migrations instead)
  logging: false,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  entities: [ClientTopic],
});

// Singleton repository instance
let clientTopicRepository: Repository<ClientTopic> | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

    await AppDataSource.initialize();
    clientTopicRepository = AppDataSource.getRepository(ClientTopic);
    console.log("✅ PostgreSQL database connection established");
  } catch (error) {
    console.error("❌ Error during PostgreSQL database initialization:", error);
    throw error;
  }
}

/**
 * Get ClientTopic repository (singleton instance)
 * @throws Error if database is not initialized
 */
export function getClientTopicRepository(): Repository<ClientTopic> {
  if (!clientTopicRepository) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return clientTopicRepository;
}
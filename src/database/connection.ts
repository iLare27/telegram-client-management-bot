/**
 * Database connection setup using TypeORM with SQLite
 */

import "reflect-metadata";
import { DataSource, Repository } from "typeorm";
import { ClientTopic } from "./entity/ClientTopic.js";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "bot.sqlite",
  synchronize: true, // Auto-creates tables (use migrations in production)
  logging: false,
  entities: [ClientTopic],
});

// Singleton repository instance
let clientTopicRepository: Repository<ClientTopic> | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    // Initialize singleton repository after connection
    clientTopicRepository = AppDataSource.getRepository(ClientTopic);
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
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


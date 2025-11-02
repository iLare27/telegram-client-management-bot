/**
 * Vercel Postgres storage adapter
 * Replaces SQLite for serverless deployment
 */

import { sql } from "@vercel/postgres";

export interface ClientTopicData {
  userId: number;
  username: string;
  firstName: string;
  topicId: number;
  topicName: string;
}

/**
 * Initialize database tables
 */
export async function initializeVercelDatabase(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS client_topic (
        user_id BIGINT PRIMARY KEY,
        username VARCHAR(255) NOT NULL DEFAULT '',
        first_name VARCHAR(255) NOT NULL DEFAULT '',
        topic_id INTEGER NOT NULL,
        topic_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Vercel Postgres initialized");
  } catch (error) {
    console.error("❌ Error initializing Vercel Postgres:", error);
    throw error;
  }
}

/**
 * Find client topic by userId
 */
export async function findClientTopic(userId: number): Promise<ClientTopicData | null> {
  try {
    const result = await sql`
      SELECT user_id as "userId", username, first_name as "firstName", 
             topic_id as "topicId", topic_name as "topicName"
      FROM client_topic 
      WHERE user_id = ${userId}
    `;
    
    return result.rows[0] as ClientTopicData || null;
  } catch (error) {
    console.error("Error finding client topic:", error);
    throw error;
  }
}

/**
 * Find client topic by topicId
 */
export async function findClientTopicByTopicId(topicId: number): Promise<ClientTopicData | null> {
  try {
    const result = await sql`
      SELECT user_id as "userId", username, first_name as "firstName",
             topic_id as "topicId", topic_name as "topicName"
      FROM client_topic
      WHERE topic_id = ${topicId}
    `;
    
    return result.rows[0] as ClientTopicData || null;
  } catch (error) {
    console.error("Error finding client topic by topicId:", error);
    throw error;
  }
}

/**
 * Save client topic (insert or update)
 */
export async function saveClientTopic(data: ClientTopicData): Promise<void> {
  try {
    await sql`
      INSERT INTO client_topic (user_id, username, first_name, topic_id, topic_name)
      VALUES (${data.userId}, ${data.username}, ${data.firstName}, ${data.topicId}, ${data.topicName})
      ON CONFLICT (user_id) 
      DO UPDATE SET
        username = ${data.username},
        first_name = ${data.firstName},
        topic_id = ${data.topicId},
        topic_name = ${data.topicName},
        updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      console.log(`⚠️  Race condition detected for user ${data.userId}`);
      // Already exists, ignore
      return;
    }
    throw error;
  }
}

/**
 * Delete client topic
 */
export async function deleteClientTopic(userId: number): Promise<void> {
  try {
    await sql`
      DELETE FROM client_topic WHERE user_id = ${userId}
    `;
  } catch (error) {
    console.error("Error deleting client topic:", error);
    throw error;
  }
}


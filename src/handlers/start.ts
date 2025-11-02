/**
 * /start command handler
 * Creates a new forum topic for the client or reuses existing one
 */

import { Context } from "grammy";
import { config } from "../config.js";
import { getClientTopicRepository } from "../database/connection.js";
import { ClientTopic } from "../database/entity/ClientTopic.js";
import { messages } from "../messages/messages.js";

export async function handleStart(ctx: Context): Promise<void> {
  // Only respond to private messages
  if (ctx.chat?.type !== "private") {
    return;
  }

  const userId = ctx.from?.id;
  const username = ctx.from?.username || "";
  const firstName = ctx.from?.first_name || "Unknown";

  if (!userId) {
    await ctx.reply(messages.unableToIdentify);
    return;
  }

  try {
    const repository = getClientTopicRepository();

    // Check if client already has a topic
    let clientTopic = await repository.findOne({
      where: { userId },
    });

    if (clientTopic) {
      // Existing client - verify topic still exists
      try {
        // Try to send a message to the existing topic
        await ctx.api.sendMessage(
          config.groupChatId,
          messages.clientReconnected(
            firstName,
            username,
            userId,
            new Date().toLocaleString()
          ),
          {
            message_thread_id: clientTopic.topicId,
          }
        );

        // Topic exists, send welcome back message
        await ctx.reply(messages.returningClient(firstName));
      } catch (error: any) {
        // Check if topic was deleted
        if (error?.description?.includes("message thread not found")) {
          console.log(messages.consoleTopicDeleted(clientTopic.topicId, userId));
          
          // Delete old record and recreate the topic
          await repository.remove(clientTopic);
          clientTopic = null; // Set to null to trigger recreation below
          
          await ctx.reply(messages.topicRecreated(firstName));
        } else {
          // Different error, rethrow
          throw error;
        }
      }
    }
    
    if (!clientTopic) {
      // New client - create a forum topic
      const topicName = username 
        ? `@${username} (ID: ${userId})`
        : `${firstName} (ID: ${userId})`;

      const forumTopic = await ctx.api.createForumTopic(
        config.groupChatId,
        topicName
      );

      // Save to database
      clientTopic = new ClientTopic();
      clientTopic.userId = userId;
      clientTopic.username = username;
      clientTopic.firstName = firstName;
      clientTopic.topicId = forumTopic.message_thread_id;
      clientTopic.topicName = topicName;

      try {
        await repository.save(clientTopic);
      } catch (saveError: any) {
        // Handle duplicate key error (race condition)
        if (saveError.code === "SQLITE_CONSTRAINT" || saveError.message?.includes("UNIQUE constraint")) {
          console.log(`⚠️  Race condition detected for user ${userId}, using existing topic`);
          // Another request already created the topic, fetch it
          const existingTopic = await repository.findOne({ where: { userId } });
          if (existingTopic) {
            clientTopic = existingTopic;
          }
        } else {
          throw saveError;
        }
      }

      // Welcome message to client
      await ctx.reply(messages.newClient(firstName));

      // Notify team in the new topic
      await ctx.api.sendMessage(
        config.groupChatId,
        messages.newClientTopic(
          firstName,
          username,
          userId,
          new Date().toLocaleString()
        ),
        {
          message_thread_id: forumTopic.message_thread_id,
        }
      );

      console.log(messages.consoleTopicCreated(userId, topicName));
    }
  } catch (error) {
    console.error("Error in handleStart:", error);
    await ctx.reply(messages.generalError);
  }
}


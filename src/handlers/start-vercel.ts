/**
 * /start command handler (Vercel version)
 * Uses Vercel Postgres instead of TypeORM
 */

import { Context } from "grammy";
import { config } from "../config.js";
import { findClientTopic, saveClientTopic, deleteClientTopic } from "../database/vercel-storage.js";
import { messages } from "../messages/messages.js";

export async function handleStartVercel(ctx: Context): Promise<void> {
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
    // Check if client already has a topic
    let clientTopic = await findClientTopic(userId);

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
          await deleteClientTopic(userId);
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
      const newClientTopic = {
        userId: userId,
        username: username,
        firstName: firstName,
        topicId: forumTopic.message_thread_id,
        topicName: topicName,
      };

      await saveClientTopic(newClientTopic);

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
    console.error("Error in handleStartVercel:", error);
    await ctx.reply(messages.generalError);
  }
}


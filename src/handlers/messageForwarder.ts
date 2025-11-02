/**
 * Message forwarding handler
 * Handles bidirectional message forwarding between clients and team
 */

import { Context } from "grammy";
import { config } from "../config.js";
import { getClientTopicRepository } from "../database/connection.js";
import { messages } from "../messages/messages.js";

/**
 * Forward messages from client to their topic in the group
 */
export async function forwardClientMessage(ctx: Context): Promise<void> {
  // Only handle private chat messages (not commands)
  if (ctx.chat?.type !== "private" || !ctx.from?.id || !ctx.message) {
    return;
  }

  const userId = ctx.from.id;

  try {
    const repository = getClientTopicRepository();
    const clientTopic = await repository.findOne({
      where: { userId },
    });

    if (!clientTopic) {
      // Client hasn't used /start yet
      await ctx.reply(messages.needStartFirst);
      return;
    }

    // Forward the message to the group topic
    await ctx.api.forwardMessage(
      config.groupChatId,
      ctx.chat.id,
      ctx.message.message_id,
      {
        message_thread_id: clientTopic.topicId,
      }
    );

    console.log(messages.consoleMessageToTopic(userId, clientTopic.topicId));
  } catch (error) {
    console.error("Error forwarding client message:", error);
    await ctx.reply(messages.messageSendFailed);
  }
}

/**
 * Forward messages from team (group topic) back to client
 */
export async function forwardTeamMessage(ctx: Context): Promise<void> {
  // Only handle messages in the configured group with a topic
  if (
    ctx.chat?.id !== config.groupChatId ||
    !ctx.message?.message_thread_id ||
    !ctx.message
  ) {
    return;
  }

  const topicId = ctx.message.message_thread_id;

  try {
    const repository = getClientTopicRepository();
    
    // Find client by topic ID
    const clientTopic = await repository.findOne({
      where: { topicId },
    });

    if (!clientTopic) {
      // This topic doesn't correspond to a client conversation
      // (might be a different topic in the group)
      return;
    }

    // Don't forward bot's own messages
    if (ctx.from?.is_bot) {
      return;
    }

    const teamMemberName = ctx.from?.first_name || "Team";
    const teamUsername = ctx.from?.username;
    
    // Format the message with team member attribution
    const messagePrefix = messages.teamMessagePrefix(teamMemberName, teamUsername);

    // Handle different message types
    if (ctx.message.text) {
      await ctx.api.sendMessage(
        clientTopic.userId,
        messagePrefix + ctx.message.text
      );
    } else if (ctx.message.photo) {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      await ctx.api.sendPhoto(
        clientTopic.userId,
        photo.file_id,
        {
          caption: messagePrefix + (ctx.message.caption || ""),
        }
      );
    } else if (ctx.message.document) {
      await ctx.api.sendDocument(
        clientTopic.userId,
        ctx.message.document.file_id,
        {
          caption: messagePrefix + (ctx.message.caption || ""),
        }
      );
    } else if (ctx.message.video) {
      await ctx.api.sendVideo(
        clientTopic.userId,
        ctx.message.video.file_id,
        {
          caption: messagePrefix + (ctx.message.caption || ""),
        }
      );
    } else if (ctx.message.voice) {
      await ctx.api.sendVoice(
        clientTopic.userId,
        ctx.message.voice.file_id,
        {
          caption: messagePrefix,
        }
      );
    } else if (ctx.message.audio) {
      await ctx.api.sendAudio(
        clientTopic.userId,
        ctx.message.audio.file_id,
        {
          caption: messagePrefix + (ctx.message.caption || ""),
        }
      );
    } else {
      // For other message types, try to forward
      await ctx.api.forwardMessage(
        clientTopic.userId,
        ctx.chat.id,
        ctx.message.message_id
      );
    }

    console.log(messages.consoleMessageToClient(clientTopic.userId));
  } catch (error) {
    console.error("Error forwarding team message:", error);
    
    // Notify in the topic about the error
    try {
      await ctx.reply(messages.failedToForward, {
        message_thread_id: topicId,
      });
    } catch (replyError) {
      console.error("Failed to send error notification:", replyError);
    }
  }
}


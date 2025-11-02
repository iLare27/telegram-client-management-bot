/**
 * Configuration module for the Telegram bot
 * Loads and validates environment variables
 */

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface Config {
  botToken: string;
  groupChatId: number;
}

function validateConfig(): Config {
  const botToken = process.env.BOT_TOKEN;
  const groupChatId = process.env.GROUP_CHAT_ID;

  if (!botToken) {
    throw new Error("BOT_TOKEN is not set in environment variables");
  }

  if (!groupChatId) {
    throw new Error("GROUP_CHAT_ID is not set in environment variables");
  }

  const parsedGroupId = parseInt(groupChatId, 10);
  if (isNaN(parsedGroupId)) {
    throw new Error("GROUP_CHAT_ID must be a valid number");
  }

  return {
    botToken,
    groupChatId: parsedGroupId,
  };
}

export const config = validateConfig();


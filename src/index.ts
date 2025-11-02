/**
 * Telegram Client Management Bot
 * 
 * A bot that manages client conversations using Telegram forum topics.
 * Each client gets their own topic in a designated group chat.
 * 
 * Setup Instructions:
 * 1. Create a .env file based on .env.example
 * 2. Get bot token from @BotFather
 * 3. Create a supergroup and enable topics (Group Settings -> Topics)
 * 4. Add the bot to the group and make it an admin with:
 *    - "Manage Topics" permission
 *    - "Delete Messages" permission (optional)
 *    - "Post Messages" permission
 * 5. Get the group ID by sending a message in the group and checking bot logs
 * 6. Install dependencies: npm install
 * 7. Run: npm run dev (development) or npm run build && npm start (production)
 */

import "reflect-metadata";
import { Bot, GrammyError, HttpError } from "grammy";
import { config } from "./config.js";
import { initializeDatabase } from "./database/connection.js";
import { handleStart } from "./handlers/start.js";
import { forwardClientMessage, forwardTeamMessage } from "./handlers/messageForwarder.js";
import { messages } from "./messages/messages.js";

// Initialize bot
const bot = new Bot(config.botToken);

// Global error handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`❌ Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Command: /start
bot.command("start", handleStart);

// Help command for team members
bot.command("help", async (ctx) => {
  if (ctx.chat?.type === "private") {
    await ctx.reply(messages.clientHelp, { parse_mode: "Markdown" });
  } else {
    await ctx.reply(messages.teamHelp, { parse_mode: "Markdown" });
  }
});

// Handle all messages (client -> team, team -> client)
bot.on("message", async (ctx) => {
  // Skip commands - they're handled separately
  if (ctx.message?.text?.startsWith("/")) {
    return;
  }

  // Forward from client to team (private chat)
  if (ctx.chat?.type === "private") {
    await forwardClientMessage(ctx);
    return;
  }

  // Forward from team to client (group with topic)
  if (ctx.chat?.id === config.groupChatId && ctx.message?.message_thread_id) {
    await forwardTeamMessage(ctx);
  }
});

// Startup function
async function main() {
  console.log("🚀 Starting Telegram Client Management Bot...\n");

  // Initialize database
  await initializeDatabase();

  // Get bot info
  const botInfo = await bot.api.getMe();
  console.log(`✅ Bot connected: @${botInfo.username}`);
  console.log(`📋 Bot ID: ${botInfo.id}`);
  console.log(`🏢 Group Chat ID: ${config.groupChatId}\n`);

  // Verify bot has access to the group
  try {
    const chat = await bot.api.getChat(config.groupChatId);
    console.log(`✅ Group verified: ${chat.title || "Unknown"}`);
    
    if (chat.type !== "supergroup") {
      console.warn("⚠️  Warning: Chat is not a supergroup. Forum topics may not work.");
    }
  } catch (error) {
    console.error("❌ Cannot access the configured group chat!");
    console.error("   Make sure the bot is added to the group and GROUP_CHAT_ID is correct.");
    console.error("   To get the group ID, add the bot to the group and send a message.");
    throw error;
  }

  // Start bot
  console.log("\n🤖 Bot is running...");
  console.log("Press Ctrl+C to stop\n");
  
  await bot.start({
    onStart: (botInfo) => {
      console.log(`✨ Listening for updates as @${botInfo.username}`);
    },
  });
}

// Handle graceful shutdown
process.once("SIGINT", () => {
  console.log("\n\n🛑 Stopping bot...");
  bot.stop();
  process.exit(0);
});

process.once("SIGTERM", () => {
  console.log("\n\n🛑 Stopping bot...");
  bot.stop();
  process.exit(0);
});

// Start the bot
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});


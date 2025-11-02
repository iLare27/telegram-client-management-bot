/**
 * Vercel Serverless Function for Telegram Webhook
 * Handles incoming updates from Telegram Bot API
 */

import { Bot, webhookCallback } from "grammy";
import { config } from "../src/config.js";
import { initializeVercelDatabase } from "../src/database/vercel-storage.js";
import { handleStartVercel } from "../src/handlers/start-vercel.js";
import { forwardClientMessageVercel, forwardTeamMessageVercel } from "../src/handlers/messageForwarder-vercel.js";
import { messages } from "../src/messages/messages.js";

// Initialize bot
const bot = new Bot(config.botToken);

// Global error handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`❌ Error while handling update ${ctx.update.update_id}:`);
  console.error("Error:", err.error);
});

// Command: /start
bot.command("start", handleStartVercel);

// Help command
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
    await forwardClientMessageVercel(ctx);
    return;
  }

  // Forward from team to client (group with topic)
  if (ctx.chat?.id === config.groupChatId && ctx.message?.message_thread_id) {
    await forwardTeamMessageVercel(ctx);
  }
});

// Initialize database once (cold start)
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeVercelDatabase();
      dbInitialized = true;
      console.log("✅ Database initialized for this instance");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // Don't throw - let the request continue, it might work anyway
    }
  }
}

// Export the webhook handler for Vercel
export default async (req: any, res: any) => {
  try {
    // Initialize DB on cold start
    await ensureDbInitialized();
    
    // Handle the webhook using std/http adapter
    const handler = webhookCallback(bot, "std/http");
    await handler(req as Request);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


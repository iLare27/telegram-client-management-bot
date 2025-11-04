import "reflect-metadata";
import { Bot, GrammyError, HttpError } from "grammy";
import { config } from "./config.js";
import { initializeDatabase } from "./database/connection.js";
import { handleStart } from "./handlers/start.js";
import { forwardClientMessage, forwardTeamMessage } from "./handlers/messageForwarder.js";
import { messages } from "./messages/messages.js";
import http from "http"; // 👈 добавили встроенный модуль

// ===============================
//  Health check server (без express)
// ===============================
const PORT = process.env.PORT || 8000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
}).listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

// ===============================
//  Telegram Bot
// ===============================
const bot = new Bot(config.botToken);

// Глобальный обработчик ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`❌ Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) console.error("Error in request:", e.description);
  else if (e instanceof HttpError) console.error("Could not contact Telegram:", e);
  else console.error("Unknown error:", e);
});

// Команды
bot.command("start", handleStart);

bot.command("help", async (ctx) => {
  if (ctx.chat?.type === "private") {
    await ctx.reply(messages.clientHelp, { parse_mode: "Markdown" });
  } else {
    await ctx.reply(messages.teamHelp, { parse_mode: "Markdown" });
  }
});

// Сообщения
bot.on("message", async (ctx) => {
  if (ctx.message?.text?.startsWith("/")) return;

  if (ctx.chat?.type === "private") {
    await forwardClientMessage(ctx);
    return;
  }

  if (ctx.chat?.id === config.groupChatId && ctx.message?.message_thread_id) {
    await forwardTeamMessage(ctx);
  }
});

// ===============================
//  Запуск
// ===============================
async function main() {
  console.log("🚀 Starting Telegram Client Management Bot...\n");

  await initializeDatabase();

  const botInfo = await bot.api.getMe();
  console.log(`✅ Bot connected: @${botInfo.username}`);
  console.log(`📋 Bot ID: ${botInfo.id}`);
  console.log(`🏢 Group Chat ID: ${config.groupChatId}\n`);

  try {
    const chat = await bot.api.getChat(config.groupChatId);
    console.log(`✅ Group verified: ${chat.title || "Unknown"}`);
    if (chat.type !== "supergroup")
      console.warn("⚠️  Warning: Chat is not a supergroup. Forum topics may not work.");
  } catch (error) {
    console.error("❌ Cannot access the configured group chat!");
    throw error;
  }

  console.log("\n🤖 Bot is running...");
  await bot.start({
    onStart: (botInfo) => {
      console.log(`✨ Listening for updates as @${botInfo.username}`);
    },
  });
}

// Graceful shutdown
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

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

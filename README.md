# Telegram Client Management Bot

A professional Telegram bot built with **grammY.js** and **TypeScript** that manages client conversations using forum topics. Each client automatically gets their own dedicated topic in a group chat where your team can respond.

## 🎯 Features

- **Automatic Topic Creation**: Creates a forum topic for each new client
- **Topic Recovery**: Automatically recreates topics if they are deleted
- **Bidirectional Messaging**: Seamlessly forwards messages between clients and team
- **Persistent Storage**: SQLite database tracks client-topic mappings
- **Media Support**: Handles text, photos, documents, videos, voice, and audio
- **Localized Messages**: All user-facing text stored in JSON for easy customization
- **Clean Architecture**: Organized code structure with TypeScript

## 📋 Prerequisites

- Node.js 18+ or later
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- A Telegram Supergroup with Topics enabled

## 🚀 Quick Start

See [QUICK_START.md](QUICK_START.md) for a 5-minute setup guide.

## 📖 Full Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
BOT_TOKEN=your_bot_token_here
GROUP_CHAT_ID=-1001234567890
```

### 3. Set Up Telegram Group

1. Create a **Supergroup** in Telegram
2. Enable **Topics**: Group Settings → Topics → Enable
3. Add your bot to the group
4. Make the bot an **Admin** with these permissions:
   - ✅ Manage Topics
   - ✅ Post Messages
   - ✅ Delete Messages (optional)

### 4. Get Group Chat ID

**Method 1 - Using @userinfobot:**
1. Forward any message from the group to [@userinfobot](https://t.me/userinfobot)
2. It will show you the group ID (starts with `-100`)

**Method 2 - Using the bot:**
1. Add bot to group first
2. Run the bot (step 5)
3. Send a message in the group
4. Check bot logs for the chat ID

### 5. Run the Bot

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

## 💬 Usage

### For Clients

1. Start a private chat with your bot
2. Send `/start` to begin
3. Describe your task or question
4. Wait for team responses (forwarded automatically)

### For Team Members

1. Open the group chat where topics are created
2. Each client has their own topic
3. Reply in the topic - messages are forwarded to the client
4. All message types (text, media, files) are supported

## 🏗️ Project Structure

```
src/
├── index.ts                    # Main bot initialization and routing
├── config.ts                   # Environment configuration
├── database/
│   ├── connection.ts          # TypeORM database setup
│   └── entity/
│       └── ClientTopic.ts     # Client-topic mapping entity
├── handlers/
│   ├── start.ts               # /start command handler
│   └── messageForwarder.ts    # Bidirectional message forwarding
└── messages/
    ├── messages.ts            # Message localization manager
    └── en.json                # English messages (customizable)
```

## 🔧 Customization

### Language Settings

The bot currently uses **Russian** as the default language. All messages are stored in JSON files for easy customization.

**Available languages:**
- 🇷🇺 Russian (`ru.json`) - **Default**
- 🇬🇧 English (`en.json`)

**To change the language:**

Edit `src/messages/messages.ts` and change the default locale:
```typescript
constructor(locale: string = "ru") {  // Change "ru" to "en" for English
```

Then rebuild: `npm run build`

### Customizing Messages

All user-facing text is stored in `src/messages/ru.json` (or `en.json`). You can:

1. **Edit existing messages**: Modify text directly in the JSON file
2. **Add translations**: Create new files like `es.json`, `uk.json`, etc.
3. **Use variables**: Template variables like `{{firstName}}` are automatically replaced

Example from `ru.json`:
```json
{
  "welcome": {
    "new_client": "👋 Добро пожаловать, {{firstName}}!\n\n..."
  }
}
```

### Adding New Languages

1. Copy `src/messages/ru.json` to `src/messages/uk.json` (or your language code)
2. Translate all strings
3. Update the `MessageManager` constructor in `messages.ts` to use your locale:
   ```typescript
   constructor(locale: string = "uk") {
   ```
4. Rebuild: `npm run build`

## 🔄 How It Works

1. **Client sends `/start`**:
   - Bot creates a forum topic in the group (or reuses existing)
   - Topic title includes username/name and user ID
   - Mapping is saved to SQLite database

2. **Client sends a message**:
   - Bot looks up client's topic ID
   - Forwards message to the appropriate topic

3. **Team member replies in topic**:
   - Bot identifies which client the topic belongs to
   - Forwards reply to client's private chat
   - Includes team member's name in the message

4. **Topic deleted**:
   - Bot detects deletion when client sends `/start` again
   - Automatically recreates the topic
   - Updates database with new topic ID

## 🛠️ Technologies

- **[grammY](https://grammy.dev/)** - Modern Telegram Bot Framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - Database ORM
- **better-sqlite3** - Fast SQLite driver
- **dotenv** - Environment configuration

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Bot token from @BotFather | `1234567890:ABCdef...` |
| `GROUP_CHAT_ID` | Supergroup chat ID (negative number) | `-1001234567890` |

## 🐛 Troubleshooting

### Bot can't access the group
- Ensure the bot is added to the group
- Verify the bot has admin permissions
- Check that `GROUP_CHAT_ID` is correct (should be negative)

### Topics not working
- Group must be a **Supergroup** (not regular group)
- Topics must be enabled in group settings
- Bot needs "Manage Topics" permission

### Messages not forwarding
- Check bot logs for errors
- Ensure database file has write permissions
- Verify client has started conversation with `/start`

### Topic deleted error
- Bot now automatically recreates deleted topics
- Client just needs to send `/start` again
- Old database entry is removed and new one is created

## 📚 Additional Documentation

- [QUICK_START.md](QUICK_START.md) - Get started in 5 minutes
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide

## 📄 License

ISC

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📮 Support

For issues or questions, please open an issue on the repository.

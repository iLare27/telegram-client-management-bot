# 🚀 Quick Start Guide

Get your Telegram Client Management Bot up and running in 5 minutes!

## Step 1: Get Bot Token (2 min)

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow prompts to choose a name and username
4. **Copy the bot token** (looks like: `1234567890:ABCdef...`)

## Step 2: Create Group (2 min)

1. Create a **new group** in Telegram
2. Go to group settings → **Convert to Supergroup**
3. Enable **Topics**: Settings → Topics → Enable Topics
4. Add your bot to the group
5. Make bot an **admin** with these permissions:
   - ✅ Post Messages
   - ✅ Manage Topics
   - ✅ Delete Messages

## Step 3: Get Group ID (1 min)

**Method 1 - Using @userinfobot:**
1. Forward any message from the group to [@userinfobot](https://t.me/userinfobot)
2. It will show you the group ID (starts with `-100`)

**Method 2 - Using the bot:**
1. Add bot to group first
2. Run the bot (step 4)
3. Send a message in the group
4. Check bot logs for the chat ID

## Step 4: Configure Bot

Create `.env` file in project root:

```bash
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
GROUP_CHAT_ID=-1001234567890
```

Replace with your actual values!

## Step 5: Install & Run

```bash
# Install dependencies
npm install

# Run the bot
npm run dev
```

You should see:
```
🚀 Starting Telegram Client Management Bot...
✅ Database connection established
✅ Bot connected: @your_bot_username
✅ Group verified: Your Group Name
🤖 Bot is running...
```

## Step 6: Test It! 🎉

1. **Open private chat** with your bot
2. Send `/start`
3. Check your group - **new topic created!**
4. Send a message to the bot
5. See it in the topic
6. Reply from the topic
7. See reply in private chat

**It works! 🎊**

## Troubleshooting

### "Cannot access the configured group chat"
- Bot not in group ➜ Add it
- Wrong GROUP_CHAT_ID ➜ Double-check the ID
- Bot not admin ➜ Make it admin

### "Chat is not a supergroup"
- Group Settings → Convert to Supergroup

### Topics not creating
- Group Settings → Topics → Enable
- Bot needs "Manage Topics" permission

## What's Next?

- 📖 Read [README.md](README.md) for full documentation
- 🧪 Follow [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Architecture Overview

```
Client (Private Chat)
       ↓ /start
    Creates Topic
       ↓
   Forum Group
       ↓
Team replies in Topic
       ↓
Forwarded to Client
```

Each client = One topic in your group!

## Need Help?

Common commands:
- `/start` - Begin conversation (clients)
- `/help` - Show help message
- `Ctrl+C` - Stop the bot

Check logs if something goes wrong - they're very informative!

---

**Happy Bot Building! 🤖✨**


# Message Localization

This directory contains the message localization system for the Telegram bot.

## Files

- `messages.ts` - Message manager that loads and processes localized strings
- `ru.json` - Russian messages (default)
- `en.json` - English messages

## Current Language

**Default: Russian (ru)**

## Changing Language

Edit `messages.ts` line 46:

```typescript
constructor(locale: string = "ru") {  // Change to "en" for English
```

Then rebuild:
```bash
npm run build
```

## Message Structure

All JSON files follow this structure:

```json
{
  "welcome": {
    "new_client": "...",
    "returning_client": "...",
    "topic_recreated": "..."
  },
  "errors": {
    "unable_to_identify": "...",
    "general_error": "...",
    "message_send_failed": "...",
    "need_start_first": "...",
    "failed_to_forward": "..."
  },
  "help": {
    "client": "...",
    "team": "..."
  },
  "notifications": {
    "new_client_topic": "...",
    "client_reconnected": "...",
    "team_message_prefix": "..."
  },
  "console": {
    "topic_created": "...",
    "topic_deleted_recreating": "...",
    "message_forwarded_to_topic": "...",
    "message_forwarded_to_client": "..."
  }
}
```

## Template Variables

Messages support template variables that are replaced at runtime:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{firstName}}` | Client's first name | "John" |
| `{{username}}` | Client's username | "@johndoe" or "" |
| `{{userId}}` | Telegram user ID | "123456789" |
| `{{timestamp}}` | Current date/time | "02.11.2025, 03:15:20" |
| `{{topicName}}` | Forum topic name | "@user (ID: 123)" |
| `{{topicId}}` | Forum topic ID | "42" |
| `{{teamMemberName}}` | Team member's name | "Alice" |
| `{{teamUsername}}` | Team member's username | "@alice" or "" |

## Adding a New Language

1. **Copy an existing file:**
   ```bash
   cp ru.json uk.json  # For Ukrainian
   ```

2. **Translate all strings** in the new file

3. **Update the default locale** in `messages.ts`:
   ```typescript
   constructor(locale: string = "uk") {
   ```

4. **Rebuild:**
   ```bash
   npm run build
   ```

## Examples

### Russian (ru.json)
```json
{
  "welcome": {
    "new_client": "👋 Добро пожаловать, {{firstName}}!"
  }
}
```

### English (en.json)
```json
{
  "welcome": {
    "new_client": "👋 Welcome, {{firstName}}!"
  }
}
```

### Ukrainian (uk.json) - Example
```json
{
  "welcome": {
    "new_client": "👋 Ласкаво просимо, {{firstName}}!"
  }
}
```

## Testing Messages

After changing messages:

1. Rebuild the project: `npm run build`
2. Restart the bot: `npm run dev`
3. Send `/start` to test welcome messages
4. Send `/help` to test help messages
5. Send a message to test forwarding

## Best Practices

1. **Keep variables intact** - Don't translate `{{firstName}}`, keep as is
2. **Maintain formatting** - Preserve line breaks (`\n`) and emoji
3. **Test thoroughly** - Always test after changing messages
4. **Backup originals** - Keep a copy before making major changes
5. **Consistent tone** - Maintain professional and friendly tone
6. **Update all sections** - When adding features, update all language files

## Fallback Behavior

If a translation file is not found, the system automatically falls back to English:

```typescript
if (locale !== "en") {
  return this.loadMessages("en");  // Fallback to English
}
```

This ensures the bot always has usable messages even if a translation is missing.


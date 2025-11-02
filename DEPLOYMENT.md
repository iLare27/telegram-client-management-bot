# Deployment Guide

Step-by-step guide for deploying the Telegram Client Management Bot.

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run in development mode (with hot reload)
npm run dev
```

## Production Deployment

### Option 1: VPS / Cloud Server (Recommended)

#### Requirements
- Node.js 18+ installed
- PM2 or systemd for process management
- Nginx (optional, for monitoring dashboard)

#### Steps

1. **Clone and build:**
```bash
git clone <your-repo>
cd tg-anti-spblock
npm install
npm run build
```

2. **Configure environment:**
```bash
nano .env
# Add your BOT_TOKEN and GROUP_CHAT_ID
```

3. **Install PM2:**
```bash
npm install -g pm2
```

4. **Start with PM2:**
```bash
pm2 start dist/index.js --name telegram-bot
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

5. **Monitor:**
```bash
pm2 logs telegram-bot
pm2 status
```

#### PM2 Ecosystem File (Optional)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

Then run:
```bash
pm2 start ecosystem.config.js
```

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  bot:
    build: .
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - GROUP_CHAT_ID=${GROUP_CHAT_ID}
    volumes:
      - ./data:/app/bot.sqlite
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

### Option 3: Systemd Service

Create `/etc/systemd/system/telegram-bot.service`:

```ini
[Unit]
Description=Telegram Client Management Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/tg-anti-spblock
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=telegram-bot

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

View logs:
```bash
sudo journalctl -u telegram-bot -f
```

## Database Backups

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/telegram-bot"
mkdir -p $BACKUP_DIR

# Copy SQLite database
cp bot.sqlite "$BACKUP_DIR/bot_$DATE.sqlite"

# Keep only last 30 backups
ls -t "$BACKUP_DIR"/bot_*.sqlite | tail -n +31 | xargs rm -f

echo "Backup completed: bot_$DATE.sqlite"
```

Add to crontab (daily at 2 AM):
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Monitoring & Logging

### Log to File

Modify `src/index.ts` to add file logging:

```typescript
import fs from 'fs';
import { appendFileSync } from 'fs';

const logFile = 'bot.log';

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  appendFileSync(logFile, logMessage);
}
```

### Log Rotation

Install logrotate config at `/etc/logrotate.d/telegram-bot`:

```
/path/to/tg-anti-spblock/bot.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
}
```

## Environment Variables for Production

Consider these additional variables:

```env
# Required
BOT_TOKEN=your_token
GROUP_CHAT_ID=-1001234567890

# Optional
NODE_ENV=production
LOG_LEVEL=info
DB_PATH=/data/bot.sqlite
MAX_RETRIES=3
TIMEOUT_MS=30000
```

## Security Best Practices

1. **File Permissions:**
```bash
chmod 600 .env
chmod 600 bot.sqlite
```

2. **Use a dedicated user:**
```bash
sudo useradd -r -s /bin/false telegram-bot
sudo chown -R telegram-bot:telegram-bot /path/to/bot
```

3. **Firewall rules:**
```bash
# Only allow outbound HTTPS (for Telegram API)
sudo ufw allow out 443/tcp
```

4. **Regular updates:**
```bash
npm audit
npm update
```

## Health Checks

Create a health check endpoint (optional):

```typescript
// Add to src/index.ts
import express from 'express';

const app = express();
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
app.listen(3000);
```

## Troubleshooting Production Issues

### Bot stops responding
```bash
pm2 restart telegram-bot
# Check logs
pm2 logs telegram-bot --lines 100
```

### Database locked
```bash
# Check for locks
lsof bot.sqlite
# Restart bot if needed
pm2 restart telegram-bot
```

### High memory usage
```bash
# Check memory
pm2 status
# Restart with memory limit
pm2 restart telegram-bot --max-memory-restart 500M
```

## Scaling Considerations

For high-traffic bots:

1. **Use PostgreSQL instead of SQLite:**
   - Better concurrent access
   - More robust for production

2. **Implement message queues:**
   - Redis for rate limiting
   - Bull for job queues

3. **Use webhooks instead of polling:**
   - More efficient for high message volume
   - Requires HTTPS endpoint

4. **Load balancing:**
   - Multiple bot instances
   - Shared database

## CI/CD Pipeline Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Bot

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/bot
            git pull
            npm install
            npm run build
            pm2 restart telegram-bot
```

## Maintenance Checklist

- [ ] Weekly: Check logs for errors
- [ ] Weekly: Verify database backups
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review and clean old data
- [ ] Quarterly: Security audit
- [ ] Yearly: Review and update documentation


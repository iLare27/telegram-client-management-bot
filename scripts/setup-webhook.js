/**
 * Script to setup Telegram webhook for Vercel deployment
 * Run: node scripts/setup-webhook.js
 */

import https from 'https';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setWebhook(botToken, webhookUrl) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getWebhookInfo(botToken) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔗 Telegram Webhook Setup for Vercel\n');

  // Get bot token
  let botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    botToken = await question('Enter your BOT_TOKEN: ');
  } else {
    console.log(`✅ Using BOT_TOKEN from .env: ${botToken.substring(0, 10)}...\n`);
  }

  // Get Vercel URL
  const vercelUrl = await question('Enter your Vercel URL (e.g., https://your-app.vercel.app): ');
  
  if (!vercelUrl.startsWith('http')) {
    console.error('❌ Error: URL must start with https://');
    rl.close();
    return;
  }

  const webhookUrl = `${vercelUrl}/api/webhook`;

  console.log(`\n📍 Setting webhook to: ${webhookUrl}\n`);

  try {
    // Set webhook
    const result = await setWebhook(botToken, webhookUrl);
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!\n');
      
      // Get webhook info
      console.log('📊 Checking webhook status...\n');
      const info = await getWebhookInfo(botToken);
      
      if (info.ok) {
        console.log('Webhook Info:');
        console.log(`  URL: ${info.result.url}`);
        console.log(`  Pending updates: ${info.result.pending_update_count}`);
        console.log(`  Last error: ${info.result.last_error_message || 'None'}`);
        console.log(`  Last error date: ${info.result.last_error_date ? new Date(info.result.last_error_date * 1000).toLocaleString() : 'Never'}\n`);
        
        if (info.result.last_error_message) {
          console.log('⚠️  Warning: There was an error with the webhook. Check your deployment!');
        } else {
          console.log('🎉 Everything looks good! Your bot is ready on Vercel!');
        }
      }
    } else {
      console.error('❌ Error setting webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  rl.close();
}

main();


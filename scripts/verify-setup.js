/**
 * Setup verification script
 * Checks if the environment is properly configured
 * Run with: node scripts/verify-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('🔍 Verifying setup...\n');

let errors = 0;
let warnings = 0;

// Check 1: .env file exists
console.log('1️⃣  Checking .env file...');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  // Read and validate .env content
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (!envContent.includes('BOT_TOKEN=') || envContent.includes('your_bot_token_here')) {
    console.log('   ⚠️  BOT_TOKEN not configured in .env');
    warnings++;
  } else {
    console.log('   ✅ BOT_TOKEN is set');
  }
  
  if (!envContent.includes('GROUP_CHAT_ID=') || envContent.includes('-1001234567890')) {
    console.log('   ⚠️  GROUP_CHAT_ID not configured in .env');
    warnings++;
  } else {
    console.log('   ✅ GROUP_CHAT_ID is set');
  }
} else {
  console.log('   ❌ .env file not found! Copy .env.example to .env');
  errors++;
}

console.log('');

// Check 2: Dependencies
console.log('2️⃣  Checking dependencies...');
const nodeModulesPath = path.join(rootDir, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
  
  const requiredPackages = ['grammy', 'dotenv', 'typeorm', 'better-sqlite3'];
  requiredPackages.forEach(pkg => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`   ✅ ${pkg} installed`);
    } else {
      console.log(`   ❌ ${pkg} not installed`);
      errors++;
    }
  });
} else {
  console.log('   ❌ node_modules not found! Run: npm install');
  errors++;
}

console.log('');

// Check 3: TypeScript build
console.log('3️⃣  Checking TypeScript build...');
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  console.log('   ✅ dist/ directory exists');
  
  const indexPath = path.join(distPath, 'index.js');
  if (fs.existsSync(indexPath)) {
    console.log('   ✅ Built files present');
  } else {
    console.log('   ⚠️  Build may be incomplete. Run: npm run build');
    warnings++;
  }
} else {
  console.log('   ⚠️  dist/ not found. Run: npm run build');
  warnings++;
}

console.log('');

// Check 4: Source files
console.log('4️⃣  Checking source files...');
const requiredFiles = [
  'src/index.ts',
  'src/config.ts',
  'src/database/connection.ts',
  'src/database/entity/ClientTopic.ts',
  'src/handlers/start.ts',
  'src/handlers/messageForwarder.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} not found`);
    errors++;
  }
});

console.log('');

// Check 5: Node.js version
console.log('5️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);
if (major >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (requires 18+)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (requires 18+)`);
  errors++;
}

console.log('');

// Summary
console.log('═'.repeat(50));
console.log('\n📊 Summary:\n');

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! Everything is set up correctly!');
  console.log('\n▶️  Run the bot with: npm run dev');
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} error(s) found - fix these first`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning(s) - recommended to fix`);
  }
  
  console.log('\n📖 Next steps:');
  if (errors > 0) {
    console.log('   1. Fix the errors listed above');
  }
  if (warnings > 0) {
    console.log(`   ${errors > 0 ? '2' : '1'}. Address the warnings if needed`);
  }
  console.log(`   ${errors + warnings > 0 ? errors + warnings + 1 : 1}. Run: npm run dev`);
}

console.log('\n' + '═'.repeat(50) + '\n');

process.exit(errors > 0 ? 1 : 0);


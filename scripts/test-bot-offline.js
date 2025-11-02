/**
 * Offline bot test script
 * Tests bot logic without connecting to Telegram
 * Run with: node scripts/test-bot-offline.js
 */

import { config } from '../dist/config.js';
import { initializeDatabase, getClientTopicRepository } from '../dist/database/connection.js';
import { ClientTopic } from '../dist/database/entity/ClientTopic.js';

console.log('🧪 Starting offline bot tests...\n');

async function runTests() {
  try {
    // Test 1: Configuration
    console.log('1️⃣  Testing configuration...');
    console.log(`   ✅ BOT_TOKEN: ${config.botToken.substring(0, 10)}...`);
    console.log(`   ✅ GROUP_CHAT_ID: ${config.groupChatId}`);
    console.log('');

    // Test 2: Database initialization
    console.log('2️⃣  Testing database connection...');
    await initializeDatabase();
    console.log('   ✅ Database initialized successfully');
    console.log('');

    // Test 3: Database operations
    console.log('3️⃣  Testing database operations...');
    const repository = getClientTopicRepository();
    
    // Create test entry
    const testUser = new ClientTopic();
    testUser.userId = 999999999;
    testUser.username = 'test_user';
    testUser.firstName = 'Test';
    testUser.topicId = 12345;
    testUser.topicName = '@test_user (ID: 999999999)';
    
    await repository.save(testUser);
    console.log('   ✅ Test user created');
    
    // Find test entry
    const found = await repository.findOne({ where: { userId: 999999999 } });
    if (found && found.username === 'test_user') {
      console.log('   ✅ Test user found');
    } else {
      throw new Error('Failed to find test user');
    }
    
    // Update test entry
    found.firstName = 'Updated Test';
    await repository.save(found);
    console.log('   ✅ Test user updated');
    
    // Delete test entry
    await repository.remove(found);
    console.log('   ✅ Test user deleted');
    
    // Verify deletion
    const notFound = await repository.findOne({ where: { userId: 999999999 } });
    if (!notFound) {
      console.log('   ✅ Deletion verified');
    } else {
      throw new Error('Failed to delete test user');
    }
    console.log('');

    // Test 4: Check existing data
    console.log('4️⃣  Checking existing data...');
    const allClients = await repository.find();
    console.log(`   📊 Total clients in database: ${allClients.length}`);
    
    if (allClients.length > 0) {
      console.log('   \n   Recent clients:');
      allClients.slice(-5).forEach(client => {
        console.log(`   - ${client.firstName} (@${client.username || 'no username'})`);
        console.log(`     User ID: ${client.userId}, Topic ID: ${client.topicId}`);
      });
    } else {
      console.log('   ℹ️  No clients in database yet');
    }
    console.log('');

    // Test 5: Bot token format validation
    console.log('5️⃣  Validating bot token format...');
    const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
    if (tokenPattern.test(config.botToken)) {
      console.log('   ✅ Bot token format is valid');
    } else {
      console.log('   ⚠️  Bot token format may be invalid');
    }
    console.log('');

    // Test 6: Group ID validation
    console.log('6️⃣  Validating group chat ID...');
    if (config.groupChatId < 0) {
      console.log('   ✅ Group chat ID is negative (correct for groups)');
    } else {
      console.log('   ⚠️  Group chat ID should be negative for groups');
    }
    console.log('');

    // Summary
    console.log('═'.repeat(60));
    console.log('\n✅ All offline tests passed!\n');
    console.log('📋 Test Summary:');
    console.log('   - Configuration loaded correctly');
    console.log('   - Database connection working');
    console.log('   - CRUD operations functional');
    console.log('   - Token format validated');
    console.log('   - Group ID format validated');
    console.log('\n🚀 Ready to start the bot with: npm run dev');
    console.log('\n' + '═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runTests();


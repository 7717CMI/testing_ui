const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: 'healthdata-auth',
});

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const auth = admin.auth();
const db = admin.firestore();

async function initializeEmulatorData() {
  console.log('\n🚀 Initializing Firebase Emulator Data...\n');
  
  try {
    // Create demo user (Enterprise access)
    console.log('Creating demo user (demo@healthdata.com)...');
    const demoUser = await auth.createUser({
      email: 'demo@healthdata.com',
      password: 'demo123',
      displayName: 'Demo User',
      emailVerified: true,
    });
    console.log('✅ Demo user created:', demoUser.uid);
    
    // Create user document
    await db.collection('users').doc(demoUser.uid).set({
      email: 'demo@healthdata.com',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      role: 'enterprise'
    });
    console.log('✅ Demo user document created');
    
    // Create subscription document (Enterprise)
    await db.collection('subscriptions').doc(demoUser.uid).set({
      plan: 'enterprise',
      status: 'active',
      createdAt: new Date().toISOString(),
      note: 'Demo account with full enterprise access'
    });
    console.log('✅ Demo subscription created (ENTERPRISE)');
    
    // Create test user (Free access)
    console.log('\nCreating test user (test@healthdata.com)...');
    const testUser = await auth.createUser({
      email: 'test@healthdata.com',
      password: 'test123',
      displayName: 'Test User',
      emailVerified: true,
    });
    console.log('✅ Test user created:', testUser.uid);
    
    // Create user document
    await db.collection('users').doc(testUser.uid).set({
      email: 'test@healthdata.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      emailVerified: true,
    });
    console.log('✅ Test user document created');
    
    // Create subscription document (Free)
    await db.collection('subscriptions').doc(testUser.uid).set({
      plan: 'free',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Test subscription created (FREE)');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ EMULATOR DATA INITIALIZED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Available Accounts:\n');
    console.log('1. Demo User (ENTERPRISE ACCESS):');
    console.log('   Email: demo@healthdata.com');
    console.log('   Password: demo123');
    console.log('   Plan: Enterprise (full access)\n');
    console.log('2. Test User (FREE ACCESS):');
    console.log('   Email: test@healthdata.com');
    console.log('   Password: test123');
    console.log('   Plan: Free (limited access)\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error initializing emulator data:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n⚠️  Users already exist in emulator!');
      console.log('This is normal if you\'ve run this script before.');
      console.log('\n📋 Use these accounts to login:\n');
      console.log('Demo User: demo@healthdata.com / demo123');
      console.log('Test User: test@healthdata.com / test123\n');
    }
  }
  
  process.exit(0);
}

// Run initialization
initializeEmulatorData();













// Script to create an admin user in Firebase
// Run this with: node scripts/createAdmin.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=================================');
console.log('   Admin User Creation Guide');
console.log('=================================\n');

console.log('To create an admin user, follow these steps:\n');

console.log('1. Go to Firebase Console: https://console.firebase.google.com');
console.log('2. Select your project: autoshowmanagment');
console.log('3. Navigate to Authentication → Users');
console.log('4. Click "Add user" and create a new user with email and password');
console.log('5. Go to Firestore Database → users collection');
console.log('6. Find the user document with your email');
console.log('7. Add a field: role = "admin" (string type)');
console.log('8. Save the changes\n');

console.log('Example user document structure:');
console.log('--------------------------------');
console.log(JSON.stringify({
  uid: 'firebase_generated_uid',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z'
}, null, 2));
console.log('--------------------------------\n');

rl.question('Press Enter to continue...', () => {
  console.log('\nAdmin user setup instructions displayed.');
  console.log('After creating the admin user, run: npm run dev\n');
  rl.close();
});

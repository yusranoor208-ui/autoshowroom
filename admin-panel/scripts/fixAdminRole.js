// Script to fix admin role in Firestore
// Run this with: node scripts/fixAdminRole.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc, setDoc } = require('firebase/firestore');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const firebaseConfig = {
  apiKey: "AIzaSyC0yTsoPOo-OpTBA4V5XgGLsmXcR2OwqmA",
  authDomain: "autoshowmanagment.firebaseapp.com",
  projectId: "autoshowmanagment",
  storageBucket: "autoshowmanagment.firebasestorage.app",
  messagingSenderId: "629185516493",
  appId: "1:629185516493:web:02c4b550304016a1772a84",
  measurementId: "G-0N3BQ2C4RQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('\n========================================');
console.log('   Fix Admin Role Script');
console.log('========================================\n');
console.log('IMPORTANT: Use the UID from Firebase Authentication, NOT Firestore document ID!\n');
console.log('Steps to find correct UID:');
console.log('1. Go to Firebase Console → Authentication → Users');
console.log('2. Find your user and copy the "User UID" column value\n');

rl.question('Enter your admin email: ', (email) => {
  rl.question('Enter the User ID (UID) from Firebase Authentication: ', async (userId) => {
    try {
      console.log('\nChecking user document...');
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('\n⚠️  User document not found. Creating new document...');
        
        await setDoc(userRef, {
          uid: userId,
          email: email,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        });
        
        console.log('\n✅ SUCCESS! New admin user document created!');
      } else {
        console.log('\n✅ User document found!');
        console.log('Current data:', userDoc.data());
        
        console.log('\nUpdating role to "admin"...');
        
        await updateDoc(userRef, {
          uid: userId,
          email: email,
          role: 'admin',
          status: 'active'
        });
        
        console.log('\n✅ SUCCESS! Admin role has been updated!');
      }
      
      console.log('\nUser details:');
      console.log('- UID:', userId);
      console.log('- Email:', email);
      console.log('- Role: admin');
      console.log('- Status: active');
      console.log('\nIMPORTANT: Clear browser cache and try logging in again!');
      console.log('Or use Incognito/Private window for testing.\n');
      
      rl.close();
      process.exit(0);
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.log('\nPlease check:');
      console.log('1. User ID is correct (from Firebase Authentication)');
      console.log('2. Internet connection is active');
      console.log('3. Firebase configuration is correct\n');
      rl.close();
      process.exit(1);
    }
  });
});

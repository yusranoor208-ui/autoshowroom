import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
// Make sure to replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user data
const adminUser = {
  email: "fatimar@786gmail.com",
  password: "123456",
  name: "fatima",
  phone: "09876543211",
  role: "admin"
};

async function createAdminUser() {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminUser.email,
      adminUser.password
    );

    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: adminUser.email,
      name: adminUser.name,
      phone: adminUser.phone,
      role: adminUser.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: false
    });

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', user.uid);
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('Role:', adminUser.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdminUser();

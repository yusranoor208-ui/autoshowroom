# Admin Panel Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

Open terminal in the `admin-panel` directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- Firebase
- Tailwind CSS
- Lucide Icons
- date-fns

### 2. Create Admin User in Firebase

You need to create an admin user in Firebase to access the admin panel.

#### Option A: Using Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `autoshowmanagment`
3. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab
   - Click "Add user" button
   - Enter email: `admin@example.com` (or your preferred email)
   - Enter password: Create a strong password
   - Click "Add user"

4. **Add Admin Role in Firestore**:
   - Go to "Firestore Database" in the left sidebar
   - Find the `users` collection
   - Find the user document with the email you just created
   - Click on the document
   - Add a new field:
     - Field: `role`
     - Type: `string`
     - Value: `admin`
   - Click "Update"

#### Option B: Using the Mobile App

1. Open your mobile app
2. Sign up with a new account
3. Go to Firebase Console → Firestore Database
4. Find the newly created user in the `users` collection
5. Add the `role: "admin"` field to that user document

### 3. Verify Firebase Configuration

The Firebase configuration is already set up in `lib/firebase.js`. It uses the same configuration as your mobile app:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC0yTsoPOo-OpTBA4V5XgGLsmXcR2OwqmA",
  authDomain: "autoshowmanagment.firebaseapp.com",
  projectId: "autoshowmanagment",
  storageBucket: "autoshowmanagment.firebasestorage.app",
  messagingSenderId: "629185516493",
  appId: "1:629185516493:web:02c4b550304016a1772a84",
  measurementId: "G-0N3BQ2C4RQ"
};
```

### 4. Run the Admin Panel

Start the development server:

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

### 5. Login to Admin Panel

1. Open your browser and go to `http://localhost:3001`
2. You'll be redirected to the login page
3. Enter your admin credentials:
   - Email: The email you created in step 2
   - Password: The password you set
4. Click "Sign In"

If login is successful, you'll be redirected to the dashboard!

## Firebase Security Rules

For production, make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Public read
      allow write: if isAdmin(); // Only admin can write
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Feedback collection
    match /feedback/{feedbackId} {
      allow read: if isAdmin();
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }
    
    // Installments collection
    match /installments/{installmentId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

## Testing the Admin Panel

### 1. Test Vehicle Management
- Go to "Vehicles" in the sidebar
- Click "Add Vehicle"
- Fill in the form and submit
- Verify the vehicle appears in the list
- Try editing and deleting

### 2. Test User Management
- Go to "Users" in the sidebar
- You should see all registered users
- Try blocking/unblocking a user

### 3. Test Notifications
- Go to "Notifications" in the sidebar
- Click "Send Notification"
- Send a test notification to all users

### 4. Test Other Modules
- Explore Orders, Categories, Transactions, etc.
- Each module has full CRUD functionality

## Common Issues and Solutions

### Issue: Cannot Login
**Solution:**
- Verify the user has `role: "admin"` in Firestore
- Check that email and password are correct
- Clear browser cache and try again

### Issue: Data Not Loading
**Solution:**
- Check Firebase Console for data
- Verify Firestore rules allow read access
- Check browser console for errors

### Issue: Port 3001 Already in Use
**Solution:**
```bash
# Change port in package.json
"dev": "next dev -p 3002"
```

### Issue: Firebase Connection Error
**Solution:**
- Verify Firebase configuration in `lib/firebase.js`
- Check internet connection
- Ensure Firebase project is active

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Deploy!

### Option 2: Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Integration with Mobile App

The admin panel is fully integrated with your React Native mobile app through Firebase:

### Real-time Sync
- **Vehicles**: Added/edited vehicles appear instantly in the mobile app
- **Orders**: Orders from mobile app appear in admin panel
- **Users**: User management affects mobile app authentication
- **Notifications**: Sent from admin panel, received in mobile app

### Shared Collections
Both admin panel and mobile app use the same Firestore collections:
- `products` - Vehicle inventory
- `orders` - Customer orders
- `users` - User accounts
- `categories` - Product categories
- `transactions` - Payments
- `feedback` - Reviews
- `installments` - Payment plans
- `chats` - Support messages
- `notifications` - Push notifications

## Next Steps

1. ✅ Install dependencies
2. ✅ Create admin user
3. ✅ Run admin panel
4. ✅ Login and test
5. 📝 Set up Firebase security rules
6. 🚀 Deploy to production
7. 📱 Test integration with mobile app

## Support

If you encounter any issues:
1. Check this guide thoroughly
2. Review Firebase Console for errors
3. Check browser console for client-side errors
4. Verify all dependencies are installed

---

**Congratulations!** Your admin panel is now ready to use! 🎉

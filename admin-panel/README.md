# Vehicle Management Admin Panel

A comprehensive web-based admin panel for managing the Vehicle Management System. Built with Next.js, React, and Firebase.

## 🚀 Features

### Dashboard
- Real-time statistics and analytics
- Quick action buttons
- Recent activity feed
- Revenue tracking

### Vehicle Management
- Add, edit, and delete vehicles
- Manage inventory (E-Scooters, Rikshaws, Batteries)
- Track stock levels
- Color and specification management

### Order Management
- View all customer orders
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Track order history
- Filter and search orders

### Category Management
- Create and manage product categories
- Organize products efficiently
- Track products per category

### User Management
- View all registered users
- Block/Unblock users
- View user details and activity
- Role management (Admin/Customer)

### Transaction Management
- Track all financial transactions
- View payment history
- Monitor revenue
- Filter by status

### Feedback Management
- View customer feedback and ratings
- Respond to reviews
- Track average ratings
- Update feedback status

### Installment Management
- Track payment installments
- Mark installments as paid
- Monitor overdue payments
- Calculate pending amounts

### Chat Support
- Real-time chat with customers
- Message history
- Multiple chat sessions
- Quick responses

### Notifications
- Send notifications to users
- Bulk notifications
- Targeted notifications
- Notification history

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account with Firestore enabled

## 🛠️ Installation

1. **Navigate to the admin panel directory:**
   ```bash
   cd admin-panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Firebase Configuration:**
   The Firebase configuration is already set up in `lib/firebase.js`. It uses the same Firebase project as your mobile app.

4. **Create an Admin User:**
   - Go to Firebase Console
   - Navigate to Firestore Database
   - Open the `users` collection
   - Find your user document or create a new one
   - Add a field: `role: "admin"`
   
   Example user document:
   ```json
   {
     "email": "admin@example.com",
     "name": "Admin User",
     "role": "admin",
     "createdAt": "2025-01-01T00:00:00.000Z"
   }
   ```

## 🚀 Running the Admin Panel

### Development Mode
```bash
npm run dev
```
The admin panel will be available at: `http://localhost:3001`

### Production Build
```bash
npm run build
npm start
```

## 🔐 Login

1. Open `http://localhost:3001` in your browser
2. You'll be redirected to the login page
3. Enter your admin credentials (email and password)
4. Only users with `role: "admin"` in Firestore can access the panel

## 📁 Project Structure

```
admin-panel/
├── app/
│   ├── dashboard/
│   │   ├── page.js              # Main dashboard
│   │   ├── vehicles/            # Vehicle management
│   │   ├── orders/              # Order management
│   │   ├── categories/          # Category management
│   │   ├── users/               # User management
│   │   ├── transactions/        # Transaction management
│   │   ├── feedback/            # Feedback management
│   │   ├── installments/        # Installment management
│   │   ├── chat/                # Chat support
│   │   └── notifications/       # Notification management
│   ├── login/
│   │   └── page.js              # Login page
│   ├── globals.css              # Global styles
│   └── layout.js                # Root layout
├── components/
│   ├── Sidebar.js               # Navigation sidebar
│   └── Header.js                # Top header
├── lib/
│   ├── firebase.js              # Firebase configuration
│   └── adminHelper.js           # Firebase helper functions
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔥 Firebase Collections

The admin panel interacts with the following Firestore collections:

- **products** - Vehicle inventory
- **orders** - Customer orders
- **users** - User accounts
- **categories** - Product categories
- **transactions** - Payment transactions
- **feedback** - Customer reviews and ratings
- **installments** - Payment installments
- **chats** - Chat conversations
- **notifications** - User notifications

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the primary color:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#7b2ff7',  // Change this
      secondary: '#6c63ff',
    },
  },
}
```

### Port
Change the port in `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001",  // Change port here
}
```

## 🔒 Security

- Admin authentication is required for all routes
- Only users with `role: "admin"` can access the panel
- Firebase security rules should be configured properly
- Never commit sensitive credentials to version control

## 📱 Integration with Mobile App

The admin panel shares the same Firebase backend with your React Native mobile app. Any changes made in the admin panel will be reflected in the mobile app in real-time.

### Shared Collections:
- Products added/edited in admin panel appear in mobile app
- Orders from mobile app appear in admin panel
- User management affects mobile app authentication
- Notifications sent from admin panel reach mobile app users

## 🐛 Troubleshooting

### Cannot Login
- Ensure your user has `role: "admin"` in Firestore
- Check Firebase configuration in `lib/firebase.js`
- Verify email and password are correct

### Data Not Loading
- Check Firebase Firestore rules
- Ensure collections exist in Firebase
- Check browser console for errors

### Port Already in Use
- Change the port in `package.json`
- Or kill the process using port 3001

## 📚 Technologies Used

- **Next.js 14** - React framework
- **React 18** - UI library
- **Firebase** - Backend and database
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase console for errors
3. Check browser console for client-side errors

## 📄 License

This project is part of the Vehicle Management System.

---

**Note:** Make sure to set up proper Firebase security rules for production use!

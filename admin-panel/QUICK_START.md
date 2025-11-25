# Quick Start Guide - Admin Panel

Get your admin panel up and running in 5 minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies (2 minutes)
```bash
cd admin-panel
npm install
```

### Step 2: Create Admin User (2 minutes)

1. Open Firebase Console: https://console.firebase.google.com
2. Go to **Authentication** → **Users** → **Add user**
3. Create user with email and password
4. Go to **Firestore Database** → **users** collection
5. Find your user and add field: `role: "admin"`

### Step 3: Run Admin Panel (30 seconds)
```bash
npm run dev
```

### Step 4: Login (30 seconds)
- Open: http://localhost:3001
- Login with your admin credentials

### Step 5: Test It! (30 seconds)
- Click "Vehicles" in sidebar
- Click "Add Vehicle" button
- Fill the form and save
- Check your mobile app - the vehicle should appear!

## ✅ That's It!

Your admin panel is now connected to your mobile app through Firebase.

## 📚 Need More Help?

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Integration Details**: See `ADMIN_PANEL_INTEGRATION.md` (in parent folder)
- **README**: See `README.md`

## 🎯 What Can You Do Now?

✅ Manage vehicles (add/edit/delete)
✅ Track orders from mobile app
✅ Manage users (block/unblock)
✅ View transactions
✅ Respond to feedback
✅ Track installments
✅ Chat with customers
✅ Send notifications

## 🐛 Common Issues

**Can't login?**
- Make sure user has `role: "admin"` in Firestore

**Port 3001 in use?**
- Change port in package.json: `"dev": "next dev -p 3002"`

**Data not loading?**
- Check Firebase Console for data
- Verify internet connection

## 🎉 Success!

You now have a fully functional admin panel integrated with your mobile app!

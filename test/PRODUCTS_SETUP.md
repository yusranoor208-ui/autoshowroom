# Products Setup Guide

## Firebase Products Integration

All products (E-Scooters, Rikshaws, and Batteries) are now stored in Firebase Firestore instead of being hardcoded.

## How to Add Products to Firebase

### Method 1: Using the App (Recommended)

1. **Run the app** and login/signup
2. **Open the drawer menu** (hamburger icon)
3. **Navigate to "🌱 Seed Products"**
4. **Click "Seed Products to Firebase"** button
5. Wait for confirmation message
6. Products will be added to your Firebase database

### Method 2: Using Node.js Script

1. Open terminal in the project root
2. Run: `node scripts/seedProducts.js`
3. Products will be added to Firebase

## Products Included

### E-Scooters (3 items)
- **METRO T9 ECO** - PKR 169,000
- **METRO THRILL** - PKR 195,000  
- **METRO E8S PRO** - PKR 299,000

### Rikshaws (1 item)
- **Electric Rikshaw X1** - PKR 450,000

### Batteries (2 items)
- **Lithium Battery 60V** - PKR 85,000
- **Lithium Battery 72V** - PKR 110,000

## Product Data Structure

Each product in Firebase has:
```javascript
{
  id: "unique_id",
  name: "Product Name",
  price: "PKR XX,XXX",
  type: "E-Scooter" | "Rikshaw" | "Battery",
  imageName: "image.png",
  colors: ["blue", "black", "red"],
  description: "Product description",
  specifications: {
    // Various specs depending on product type
  }
}
```

## Important Notes

- ⚠️ **Run seed only once** - The script checks if products already exist
- 📱 Products are fetched from Firebase when you open each category page
- 🖼️ Images are stored locally in `assets/images/` folder
- 🔄 Products can be managed through Firebase Console

## Firebase Collection

- **Collection Name**: `products`
- **Location**: Firestore Database

## Troubleshooting

### Products not showing?
1. Check Firebase Console to verify products exist
2. Check internet connection
3. Verify Firebase configuration in `firebase.js`

### Seed button not working?
1. Check console logs for errors
2. Verify Firebase permissions
3. Ensure you're logged in

## Adding New Products

To add new products manually:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `products` collection
4. Click "Add Document"
5. Add product data following the structure above

Or update `app/Helper/seedProductsHelper.js` and re-run the seed.

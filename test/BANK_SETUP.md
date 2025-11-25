# Bank Collection Setup for Installment Management

## Overview

This document explains the bank collection setup and how it integrates with the installment payment system.

## Features

1. **Bank Collection**: Stores Pakistani bank details for installment payments
2. **Bank Selection**: Users can select a bank during installment confirmation
3. **Payment Screenshot Upload**: Users can upload payment receipts to Cloudinary
4. **Order Integration**: Bank details are saved with orders for payment tracking

## Setup Instructions

### 1. Install Dependencies

Make sure you have `expo-image-picker` installed:

```bash
cd test
npm install expo-image-picker
```

### 2. Seed Bank Data

Run the seed script to populate the `banks` collection:

```bash
cd test/app/scripts
node seedBanks.js
```

This will create 10 banks in your Firestore `banks` collection:
- HBL (Habib Bank Limited)
- UBL (United Bank Limited)
- MCB Bank
- Allied Bank Limited
- Bank Alfalah
- JazzCash (Digital Wallet)
- EasyPaisa (Digital Wallet)
- Meezan Bank
- Standard Chartered Bank
- Askari Bank

### 3. Cloudinary Configuration

The app uses Cloudinary for image uploads. Make sure your Cloudinary credentials are configured in `test/app/Helper/firebaseHelper.js`:

- `CLOUD_NAME`: Your Cloudinary cloud name
- `UPLOAD_PRESET`: Your upload preset name

## How It Works

### Installment Confirmation Flow

1. **User selects installment plan** on Product Details page
2. **Navigates to InstallmentConfirmation** page
3. **Selects a bank** from available Pakistani banks
4. **Views bank details** (account number, IBAN, branch, etc.)
5. **Optionally uploads payment screenshot** (camera or gallery)
6. **Confirms order** - Order is saved with bank details and screenshot URL

### Order Structure

When an order is saved with installment plan, it includes:

```javascript
{
  // ... other order fields
  bankDetails: {
    bankId: "bank_document_id",
    bankName: "HBL (Habib Bank Limited)",
    accountNumber: "PK12HBLB1234567890123456",
    accountName: "Auto Showroom",
    iban: "PK12HBLB1234567890123456",
    branch: "Main Branch, Karachi",
    swiftCode: "HBLBPKKA",
    phone: "+92-21-111-425-425",
    email: "support@hbl.com"
  },
  paymentScreenshot: "https://cloudinary.com/image_url",
  // ... installment payment details
}
```

### My Orders Page

The My Orders page displays:
- Bank information for each installment order
- Payment screenshot status (if uploaded)
- All installment plan details

## Bank Collection Schema

Each bank document contains:

```javascript
{
  name: "Bank Name",
  accountName: "Account Holder Name",
  accountNumber: "Account Number",
  iban: "IBAN Code",
  branch: "Branch Name and Location",
  swiftCode: "SWIFT Code",
  routingNumber: "Routing Number",
  phone: "Contact Phone",
  email: "Contact Email",
  isActive: true/false,
  paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
  logo: "Bank Logo URL",
  isDigitalWallet: true/false, // For JazzCash/EasyPaisa
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Image Upload

### Permissions Required

- **Camera**: For taking payment screenshots
- **Photo Library**: For selecting screenshots from gallery

### Upload Process

1. User taps "Upload Payment Screenshot"
2. Chooses "Take Photo" or "Choose from Gallery"
3. Image is uploaded to Cloudinary
4. Cloudinary URL is saved with the order
5. Success indicator is shown

## Customization

### Adding New Banks

Edit `test/app/scripts/seedBanks.js` and add bank objects to the `pakistaniBanks` array, then run the seed script again.

### Updating Bank Details

You can update bank details directly in Firestore or create an admin interface to manage banks.

### Changing Cloudinary Settings

Update the Cloudinary configuration in `test/app/Helper/firebaseHelper.js`:

```javascript
const CLOUD_NAME = "your_cloud_name";
const UPLOAD_PRESET = "your_upload_preset";
```

## Testing

1. **Test Bank Selection**: 
   - Go to Product Details → Select Installment Plan → Buy Now
   - Verify banks are loaded and selectable
   - Check bank details are displayed correctly

2. **Test Screenshot Upload**:
   - Select a bank
   - Upload a payment screenshot
   - Verify upload success indicator
   - Check order is saved with screenshot URL

3. **Test Order Display**:
   - Go to Profile → My Orders
   - Verify bank details are shown for installment orders
   - Check screenshot status is displayed

## Notes

- All account numbers and IBANs in the seed script are **dummy data** for demonstration
- Replace with actual bank account details for production use
- Ensure Cloudinary upload preset allows unsigned uploads or configure authentication
- Bank selection is required before confirming installment orders
- Screenshot upload is optional but recommended for payment verification


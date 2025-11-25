# Seed Banks Collection

This script seeds the Firestore `banks` collection with Pakistani bank data for installment payment management.

## Usage

### Option 1: Run with Node.js

```bash
cd test/app/scripts
node seedBanks.js
```

### Option 2: Run with npm script (if added to package.json)

```bash
npm run seed-banks
```

## What it does

- Creates a `banks` collection in Firestore
- Adds 10 Pakistani banks including:
  - Traditional banks (HBL, UBL, MCB, Allied Bank, Bank Alfalah, Meezan Bank, Standard Chartered, Askari Bank)
  - Digital wallets (JazzCash, EasyPaisa)
- Each bank includes:
  - Account name and number
  - IBAN
  - Branch details
  - SWIFT code
  - Contact information
  - Payment methods supported

## Banks Included

1. **HBL (Habib Bank Limited)**
2. **UBL (United Bank Limited)**
3. **MCB Bank (Muslim Commercial Bank)**
4. **Allied Bank Limited**
5. **Bank Alfalah**
6. **JazzCash** (Digital Wallet)
7. **EasyPaisa** (Digital Wallet)
8. **Meezan Bank**
9. **Standard Chartered Bank**
10. **Askari Bank**

## Requirements

- Firebase project must be initialized
- Firestore database must be accessible
- Firebase config must be correct in the script

## Notes

- All banks are set to `isActive: true` by default
- Account numbers and IBANs are dummy data for demonstration
- Replace with actual account details for production use


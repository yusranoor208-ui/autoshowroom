// Script to seed banks collection with Pakistani bank data
// Run with: node seedBanks.js (from the scripts directory)

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

// Pakistani Banks Data
const pakistaniBanks = [
  {
    name: "HBL (Habib Bank Limited)",
    accountName: "Auto Showroom",
    accountNumber: "PK12HBLB1234567890123456",
    iban: "PK12HBLB1234567890123456",
    branch: "Main Branch, Karachi",
    swiftCode: "HBLBPKKA",
    routingNumber: "HBLB0000123",
    phone: "+92-21-111-425-425",
    email: "support@hbl.com",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/HBL_logo.svg/200px-HBL_logo.svg.png"
  },
  {
    name: "UBL (United Bank Limited)",
    accountName: "Auto Showroom",
    accountNumber: "PK13UBLB2345678901234567",
    iban: "PK13UBLB2345678901234567",
    branch: "Gulshan Branch, Karachi",
    swiftCode: "UBLBPKKA",
    routingNumber: "UBLB0000234",
    phone: "+92-21-111-825-825",
    email: "support@ubl.com.pk",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/UBL_logo.svg/200px-UBL_logo.svg.png"
  },
  {
    name: "MCB Bank (Muslim Commercial Bank)",
    accountName: "Auto Showroom",
    accountNumber: "PK14MCBB3456789012345678",
    iban: "PK14MCBB3456789012345678",
    branch: "I.I. Chundrigar Road, Karachi",
    swiftCode: "MCBPPKKA",
    routingNumber: "MCBB0000345",
    phone: "+92-21-111-622-622",
    email: "info@mcb.com.pk",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/MCB_Bank_logo.svg/200px-MCB_Bank_logo.svg.png"
  },
  {
    name: "Allied Bank Limited",
    accountName: "Auto Showroom",
    accountNumber: "PK15ABLB4567890123456789",
    iban: "PK15ABLB4567890123456789",
    branch: "Main Branch, Lahore",
    swiftCode: "ABLAPKKA",
    routingNumber: "ABLB0000456",
    phone: "+92-42-111-225-225",
    email: "info@abl.com",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Allied_Bank_logo.svg/200px-Allied_Bank_logo.svg.png"
  },
  {
    name: "Bank Alfalah",
    accountName: "Auto Showroom",
    accountNumber: "PK16ALFL5678901234567890",
    iban: "PK16ALFL5678901234567890",
    branch: "Clifton Branch, Karachi",
    swiftCode: "ALFHPKKA",
    routingNumber: "ALFL0000567",
    phone: "+92-21-111-225-111",
    email: "info@bankalfalah.com",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bank_Alfalah_logo.svg/200px-Bank_Alfalah_logo.svg.png"
  },
  {
    name: "JazzCash",
    accountName: "Auto Showroom",
    accountNumber: "03001234567",
    iban: "N/A",
    branch: "Digital Wallet",
    swiftCode: "N/A",
    routingNumber: "JAZZ0000001",
    phone: "+92-300-1234567",
    email: "support@jazzcash.com.pk",
    isActive: true,
    paymentMethods: ["JazzCash", "Mobile Wallet"],
    logo: "https://www.jazz.com.pk/assets/images/jazzcash-logo.png",
    isDigitalWallet: true
  },
  {
    name: "EasyPaisa",
    accountName: "Auto Showroom",
    accountNumber: "03121234567",
    iban: "N/A",
    branch: "Digital Wallet",
    swiftCode: "N/A",
    routingNumber: "EASY0000001",
    phone: "+92-312-1234567",
    email: "support@easypaisa.com.pk",
    isActive: true,
    paymentMethods: ["EasyPaisa", "Mobile Wallet"],
    logo: "https://www.easypaisa.com.pk/images/easypaisa-logo.png",
    isDigitalWallet: true
  },
  {
    name: "Meezan Bank",
    accountName: "Auto Showroom",
    accountNumber: "PK17MEZN6789012345678901",
    iban: "PK17MEZN6789012345678901",
    branch: "Main Branch, Karachi",
    swiftCode: "MEZNPKKA",
    routingNumber: "MEZN0000678",
    phone: "+92-21-111-331-331",
    email: "info@meezanbank.com",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Meezan_Bank_logo.svg/200px-Meezan_Bank_logo.svg.png"
  },
  {
    name: "Standard Chartered Bank",
    accountName: "Auto Showroom",
    accountNumber: "PK18SCBL7890123456789012",
    iban: "PK18SCBL7890123456789012",
    branch: "I.I. Chundrigar Road, Karachi",
    swiftCode: "SCBLPKKA",
    routingNumber: "SCBL0000789",
    phone: "+92-21-111-002-002",
    email: "pakistan.service@sc.com",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Standard_Chartered_logo.svg/200px-Standard_Chartered_logo.svg.png"
  },
  {
    name: "Askari Bank",
    accountName: "Auto Showroom",
    accountNumber: "PK19ASKB8901234567890123",
    iban: "PK19ASKB8901234567890123",
    branch: "Main Branch, Rawalpindi",
    swiftCode: "ASCMPKKA",
    routingNumber: "ASKB0000890",
    phone: "+92-51-111-227-227",
    email: "info@askaribank.com.pk",
    isActive: true,
    paymentMethods: ["Bank Transfer", "JazzCash", "EasyPaisa"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Askari_Bank_logo.svg/200px-Askari_Bank_logo.svg.png"
  }
];

async function seedBanks() {
  try {
    console.log('Starting to seed banks collection...');
    
    const banksRef = collection(db, 'banks');
    
    for (const bank of pakistaniBanks) {
      const bankData = {
        ...bank,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(banksRef, bankData);
      console.log(`✓ Added bank: ${bank.name} with ID: ${docRef.id}`);
    }
    
    console.log('\n✅ Successfully seeded all banks!');
    console.log(`Total banks added: ${pakistaniBanks.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding banks:', error);
    throw error;
  }
}

// Run the seed function
seedBanks()
  .then(() => {
    console.log('\n🎉 Bank seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Bank seeding failed:', error);
    process.exit(1);
  });


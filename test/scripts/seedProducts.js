// Script to seed products to Firebase
// Run this once to add all products to Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0yTsoPOo-OpTBA4V5XgGLsmXcR2OwqmA",
  authDomain: "autoshowmanagment.firebaseapp.com",
  projectId: "autoshowmanagment",
  storageBucket: "autoshowmanagment.firebasestorage.app",
  messagingSenderId: "629185516493",
  appId: "1:629185516493:web:02c4b550304016a1772a84",
  measurementId: "G-0N3BQ2C4RQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Products data
const products = [
  // E-Scooters
  {
    id: 1,
    name: "METRO T9 ECO",
    price: "PKR 169,000",
    type: "E-Scooter",
    imageName: "escooterW.png",
    colors: ["blue", "black", "red"],
    colorImages: {
      blue: "escooterW.png",
      black: "EscooterB.png",
      red: "escooter5.png",
    },
    description: "Eco-friendly electric scooter with long battery life",
    specifications: {
      topSpeed: "45 km/h",
      range: "60 km",
      batteryCapacity: "60V 20Ah",
      chargingTime: "6-8 hours",
      weight: "85 kg",
    },
  },
  {
    id: 2,
    name: "METRO THRILL",
    price: "PKR 195,000",
    type: "E-Scooter",
    imageName: "escooter5.png",
    colors: ["blue", "black", "red"],
    colorImages: {
      blue: "escooterW.png",
      black: "EscooterB.png",
      red: "escooter5.png",
    },
    description: "High-performance electric scooter for thrill seekers",
    specifications: {
      topSpeed: "55 km/h",
      range: "70 km",
      batteryCapacity: "72V 20Ah",
      chargingTime: "6-8 hours",
      weight: "90 kg",
    },
  },
  {
    id: 3,
    name: "METRO E8S PRO",
    price: "PKR 299,000",
    type: "E-Scooter",
    imageName: "EscooterB.png",
    colors: ["blue", "black", "red"],
    colorImages: {
      blue: "escooterW.png",
      black: "EscooterB.png",
      red: "escooter5.png",
    },
    description: "Premium electric scooter with advanced features",
    specifications: {
      topSpeed: "65 km/h",
      range: "90 km",
      batteryCapacity: "72V 32Ah",
      chargingTime: "7-9 hours",
      weight: "95 kg",
    },
  },
  // Rikshaws
  {
    id: 101,
    name: "Electric Rikshaw X1",
    price: "PKR 450,000",
    type: "Rikshaw",
    imageName: "rikshaw.png",
    colors: ["blue", "black", "red", "white"],
    description: "Spacious electric rickshaw for passenger transport",
    specifications: {
      topSpeed: "40 km/h",
      range: "80 km",
      batteryCapacity: "72V 100Ah",
      chargingTime: "8-10 hours",
      seatingCapacity: "4 passengers",
      weight: "350 kg",
    },
  },
  // Batteries
  {
    id: 201,
    name: "Lithium Battery 60V",
    price: "PKR 85,000",
    type: "Battery",
    imageName: "Battery.png",
    colors: ["black", "gray"],
    description: "High-capacity lithium battery for electric vehicles",
    specifications: {
      voltage: "60V",
      capacity: "20Ah",
      weight: "15 kg",
      lifespan: "1000+ cycles",
      warranty: "1 year",
    },
  },
  {
    id: 202,
    name: "Lithium Battery 72V",
    price: "PKR 110,000",
    type: "Battery",
    imageName: "Battery.png",
    colors: ["black", "gray"],
    description: "Premium lithium battery with extended range",
    specifications: {
      voltage: "72V",
      capacity: "32Ah",
      weight: "22 kg",
      lifespan: "1200+ cycles",
      warranty: "2 years",
    },
  },
];

async function seedProducts() {
  try {
    console.log("🌱 Starting to seed products...");
    
    // Check if products already exist
    const querySnapshot = await getDocs(collection(db, "products"));
    if (!querySnapshot.empty) {
      console.log("⚠️  Products collection already has data. Skipping seed.");
      console.log(`Found ${querySnapshot.size} existing products.`);
      return;
    }

    // Add each product to Firestore
    for (const product of products) {
      const docRef = await addDoc(collection(db, "products"), product);
      console.log(`✅ Added ${product.name} with ID: ${docRef.id}`);
    }

    console.log("🎉 Successfully seeded all products!");
    console.log(`Total products added: ${products.length}`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
}

// Run the seed function
seedProducts().then(() => {
  console.log("✨ Seed script completed!");
  process.exit(0);
});

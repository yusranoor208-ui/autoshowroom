// Helper to seed products to Firebase from React Native app
import { addData, getAllData } from "./firebaseHelper";

export const productsData = [
  // E-Scooters
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "101",
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
    id: "201",
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
    id: "202",
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

export const seedProducts = async () => {
  try {
    console.log("🌱 Starting to seed products...");
    
    // Check if products already exist
    const existingProducts = await getAllData("products");
    if (existingProducts && existingProducts.length > 0) {
      console.log("⚠️  Products already exist in database");
      return {
        success: false,
        message: `Products already exist (${existingProducts.length} found)`,
        count: existingProducts.length,
      };
    }

    // Add each product to Firestore
    let addedCount = 0;
    for (const product of productsData) {
      await addData("products", product);
      addedCount++;
      console.log(`✅ Added ${product.name}`);
    }

    console.log("🎉 Successfully seeded all products!");
    return {
      success: true,
      message: `Successfully added ${addedCount} products`,
      count: addedCount,
    };
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      count: 0,
    };
  }
};

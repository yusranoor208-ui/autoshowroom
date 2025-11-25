// Helper to seed categories to Firebase from React Native app
import { addData, getAllData } from "./firebaseHelper";

export const categoriesData = [
  {
    id: "1",
    name: "Rikshaw",
    imageName: "rikshaw.png",
    route: "Rikshaw",
    description: "Electric Rikshaws for passenger transport",
  },
  {
    id: "2",
    name: "E-Scooter",
    imageName: "scooty.png",
    route: "Escooter",
    description: "Electric scooters for personal transportation",
  },
  {
    id: "3",
    name: "Batteries",
    imageName: "Battery.png",
    route: "Batteries",
    description: "High-capacity lithium batteries",
  },
];

export const seedCategories = async () => {
  try {
    console.log("🌱 Starting to seed categories...");
    
    // Check if categories already exist
    const existingCategories = await getAllData("categories");
    if (existingCategories && existingCategories.length > 0) {
      console.log("⚠️  Categories already exist in database");
      return {
        success: false,
        message: `Categories already exist (${existingCategories.length} found)`,
        count: existingCategories.length,
      };
    }

    // Add each category to Firestore
    let addedCount = 0;
    for (const category of categoriesData) {
      await addData("categories", category);
      addedCount++;
      console.log(`✅ Added ${category.name}`);
    }

    console.log("🎉 Successfully seeded all categories!");
    return {
      success: true,
      message: `Successfully added ${addedCount} categories`,
      count: addedCount,
    };
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      count: 0,
    };
  }
};

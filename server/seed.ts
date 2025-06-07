import 'dotenv/config';
import { db } from "./db";
import { schemes } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Always clear existing schemes before seeding
  await db.delete(schemes);

  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);
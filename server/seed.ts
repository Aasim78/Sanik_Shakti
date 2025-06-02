import { db } from "./db";
import { schemes } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Check if schemes already exist
  const existingSchemes = await db.select().from(schemes);
  if (existingSchemes.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Seed initial welfare schemes
  const seedSchemes = [
    {
      title: "Children Education Grant",
      description: "Financial assistance for children's education including school fees, books, and uniform expenses.",
      category: "education",
      amount: 25000,
      eligibility: "All service personnel",
      deadline: "March 31, 2025",
      processingTime: "15-20 days",
      isActive: true,
    },
    {
      title: "Medical Emergency Fund",
      description: "Emergency medical assistance for critical health conditions and surgeries for personnel and families.",
      category: "medical",
      amount: 50000,
      eligibility: "Personnel & families",
      deadline: "Open year-round",
      processingTime: "7-10 days",
      isActive: true,
    },
    {
      title: "Home Loan Subsidy",
      description: "Interest subsidy on home loans for armed forces personnel to support homeownership.",
      category: "housing",
      amount: 200000,
      eligibility: "Active service only",
      deadline: "December 31, 2025",
      processingTime: "30-45 days",
      isActive: true,
    },
    {
      title: "Family Welfare Allowance",
      description: "Monthly allowance for families of armed forces personnel to support daily expenses.",
      category: "family",
      amount: 8000,
      eligibility: "All families",
      deadline: "Apply anytime",
      processingTime: "10-15 days",
      isActive: true,
    },
    {
      title: "Skill Development Program",
      description: "Training and certification programs for skill development and career advancement.",
      category: "education",
      amount: 15000,
      eligibility: "Active service personnel",
      deadline: "June 30, 2025",
      processingTime: "20-25 days",
      isActive: true,
    },
  ];

  await db.insert(schemes).values(seedSchemes);
  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);
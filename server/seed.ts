import "./env";
import { db } from "./db";
import { schemes } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database...");

  const reset = process.env.SEED_RESET === "true";
  if (reset) {
    console.log("SEED_RESET=true -> clearing existing schemes...");
    await db.delete(schemes);
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schemes);

  if (count > 0) {
    console.log(`Schemes already exist (${count}); skipping demo seed.`);
    return;
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 7);

  const endDate = new Date(now);
  endDate.setMonth(now.getMonth() + 6);

  await db.insert(schemes).values([
    {
      title: "Education Scholarship for Wards",
      description: "Scholarship support for children of serving and retired personnel for school and higher education.",
      category: "education",
      amount: 50000,
      eligibility: "Serving/Retired personnel and their wards",
      deadline: "31-03-2026",
      processingTime: "15-30 days",
      isActive: true,
      startDate,
      endDate,
      maxBeneficiaries: 5000,
      documents: ["Service ID", "Student ID", "Previous Marksheet"],
      applicationProcess: "Apply online and upload required documents.",
      benefits: "Tuition assistance, exam fee support.",
      fundingSource: "Welfare Fund",
      contactPerson: "Education Cell",
      contactEmail: "education@welfare.local",
      contactPhone: "+91-00000-00000",
      tags: ["scholarship", "children"],
      status: "ACTIVE",
    },
    {
      title: "Medical Reimbursement Grant",
      description: "Reimbursement assistance for medical treatments at empanelled hospitals.",
      category: "medical",
      amount: 150000,
      eligibility: "All personnel and dependents",
      deadline: "Ongoing",
      processingTime: "7-14 days",
      isActive: true,
      startDate,
      endDate,
      maxBeneficiaries: 10000,
      documents: ["Hospital Bill", "Prescription", "Discharge Summary"],
      applicationProcess: "Submit claim online with scanned documents.",
      benefits: "Partial/Full reimbursement based on policy.",
      fundingSource: "Medical Welfare",
      contactPerson: "Medical Desk",
      contactEmail: "medical@welfare.local",
      contactPhone: "+91-00000-00001",
      tags: ["health", "reimbursement"],
      status: "ACTIVE",
    },
    {
      title: "Housing Repair Assistance",
      description: "Support for essential home repairs for eligible beneficiaries.",
      category: "housing",
      amount: 80000,
      eligibility: "Serving/Retired personnel",
      deadline: "30-06-2026",
      processingTime: "20-40 days",
      isActive: true,
      startDate,
      endDate,
      maxBeneficiaries: 2000,
      documents: ["Proof of Residence", "Repair Estimate", "Service ID"],
      applicationProcess: "Apply online; verification visit may be scheduled.",
      benefits: "One-time repair grant.",
      fundingSource: "Housing Welfare",
      contactPerson: "Housing Cell",
      contactEmail: "housing@welfare.local",
      contactPhone: "+91-00000-00002",
      tags: ["home", "repair"],
      status: "ACTIVE",
    },
    {
      title: "Family Support Pension Top-up",
      description: "Additional financial support for families in special circumstances.",
      category: "family",
      amount: 60000,
      eligibility: "Families of personnel (case-based)",
      deadline: "31-12-2026",
      processingTime: "30-45 days",
      isActive: true,
      startDate,
      endDate,
      maxBeneficiaries: 1500,
      documents: ["Dependents Proof", "Bank Details", "Service Record"],
      applicationProcess: "Apply online; case review by welfare committee.",
      benefits: "Annual top-up assistance.",
      fundingSource: "Family Welfare",
      contactPerson: "Family Desk",
      contactEmail: "family@welfare.local",
      contactPhone: "+91-00000-00003",
      tags: ["family", "support"],
      status: "ACTIVE",
    },
  ]);

  console.log("Demo schemes inserted successfully.");
}

seedDatabase().catch(console.error);
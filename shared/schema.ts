import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  serviceNumber: text("service_number").unique(),
  role: text("role").notNull(), // 'soldier', 'family', 'admin'
  aadhaarNumber: text("aadhaar_number").unique(),
  aadhaarVerified: boolean("aadhaar_verified").default(false),
  lastVerificationDate: timestamp("last_verification_date"),
  verificationMethod: text("verification_method"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schemes = pgTable("schemes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'education', 'medical', 'housing', 'family'
  amount: integer("amount").notNull(),
  eligibility: text("eligibility").notNull(),
  deadline: text("deadline").notNull(),
  processingTime: text("processing_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  maxBeneficiaries: integer("max_beneficiaries"),
  currentBeneficiaries: integer("current_beneficiaries").default(0),
  documents: text("required_documents").array(),
  applicationProcess: text("application_process").notNull(),
  benefits: text("benefits").notNull(),
  fundingSource: text("funding_source"),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  tags: text("tags").array(),
  status: text("status").notNull().default("ACTIVE"), // 'ACTIVE', 'PAUSED', 'ENDED', 'UPCOMING'
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  schemeId: integer("scheme_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
  comments: text("comments"),
});

export const grievances = pgTable("grievances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("filed"), // 'filed', 'in_progress', 'resolved'
  filedAt: timestamp("filed_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by"),
  resolution: text("resolution"),
});

export const sosAlerts = pgTable("sos_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emergencyType: text("emergency_type").notNull(),
  message: text("message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: integer("acknowledged_by"),
});

export const aadhaarVerificationLogs = pgTable('aadhaar_verification_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  aadhaarNumber: text('aadhaar_number'),
  verificationType: text('verification_type'),
  verificationStatus: text('verification_status'),
  errorMessage: text('error_message'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  txnId: text('txn_id'),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSchemeSchema = createInsertSchema(schemes).omit({
  id: true,
  createdAt: true,
  currentBeneficiaries: true,
  lastUpdated: true,
  updatedBy: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  comments: true,
});

export const insertGrievanceSchema = createInsertSchema(grievances).omit({
  id: true,
  filedAt: true,
  resolvedAt: true,
  resolvedBy: true,
  resolution: true,
});

export const insertSosAlertSchema = createInsertSchema(sosAlerts).omit({
  id: true,
  sentAt: true,
  acknowledgedAt: true,
  acknowledgedBy: true,
});

export const insertAadhaarVerificationLog = createInsertSchema(aadhaarVerificationLogs).omit({
  id: true,
  createdAt: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Scheme = typeof schemes.$inferSelect;
export type InsertScheme = z.infer<typeof insertSchemeSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Grievance = typeof grievances.$inferSelect;
export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;
export type SosAlert = typeof sosAlerts.$inferSelect;
export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;
export type AadhaarVerificationLog = typeof aadhaarVerificationLogs.$inferSelect;
export type InsertAadhaarVerificationLog = z.infer<typeof insertAadhaarVerificationLog>;

// Aadhaar Verification Types
export interface AadhaarVerificationRequest {
  aadhaarNumber: string;
  biometricData?: string; // Base64 encoded biometric data
  otp?: string;
  verificationType: 'BIOMETRIC' | 'OTP';
  txnId?: string; // Transaction ID for OTP and biometric verification
}

export interface AadhaarVerificationResponse {
  success: boolean;
  verified: boolean;
  aadhaarHolder?: {
    name: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    photo: string; // Base64 encoded photo
  };
  error?: string;
  txnId: string;
}

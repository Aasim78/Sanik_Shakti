import { 
  User, InsertUser, 
  Scheme, InsertScheme,
  Application, InsertApplication,
  Grievance, InsertGrievance,
  SosAlert, InsertSosAlert,
  AadhaarVerificationLog, InsertAadhaarVerificationLog,
  users, schemes, applications, grievances, sosAlerts, aadhaarVerificationLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, sql, isNull } from "drizzle-orm";

interface SchemeFilters {
  category?: string;
  status?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  tags?: string[];
}

interface SchemeUpdate {
  title?: string;
  description?: string;
  category?: string;
  amount?: number;
  eligibility?: string;
  deadline?: string;
  processingTime?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  maxBeneficiaries?: number;
  documents?: string[];
  applicationProcess?: string;
  benefits?: string;
  fundingSource?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  status?: string;
}

interface UpdateSosAlert {
  acknowledgedAt?: Date;
  acknowledgedBy?: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByServiceNumber(serviceNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAadhaarStatus(userId: number, aadhaarNumber: string, verified: boolean): Promise<User>;
  
  // Enhanced Scheme methods
  getSchemes(filters?: SchemeFilters): Promise<Scheme[]>;
  getScheme(id: number): Promise<Scheme | undefined>;
  createScheme(scheme: InsertScheme): Promise<Scheme>;
  updateScheme(id: number, update: SchemeUpdate, updatedBy: number): Promise<Scheme | undefined>;
  deleteScheme(id: number): Promise<boolean>;
  getSchemesByCategory(category: string): Promise<Scheme[]>;
  getActiveSchemes(): Promise<Scheme[]>;
  getUpcomingSchemes(): Promise<Scheme[]>;
  searchSchemes(query: string): Promise<Scheme[]>;
  getSchemeApplicationStats(schemeId: number): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  incrementBeneficiaries(schemeId: number): Promise<void>;
  decrementBeneficiaries(schemeId: number): Promise<void>;
  
  // Application methods
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string, reviewedBy?: number, comments?: string): Promise<Application | undefined>;
  
  // Grievance methods
  getGrievancesByUser(userId: number): Promise<Grievance[]>;
  getAllGrievances(): Promise<Grievance[]>;
  createGrievance(grievance: InsertGrievance): Promise<Grievance>;
  updateGrievanceStatus(id: number, status: string, resolvedBy?: number, resolution?: string): Promise<Grievance | undefined>;
  
  // SOS Alert methods
  createSosAlert(alert: InsertSosAlert): Promise<SosAlert>;
  getSosAlerts(): Promise<SosAlert[]>;
  updateSosAlert(id: number, update: UpdateSosAlert): Promise<SosAlert | undefined>;
  getActiveSosAlerts(): Promise<SosAlert[]>;

  // Aadhaar Verification methods
  createAadhaarVerificationLog(log: InsertAadhaarVerificationLog): Promise<AadhaarVerificationLog>;
  getAadhaarVerificationLogs(userId: number): Promise<AadhaarVerificationLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByServiceNumber(serviceNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.serviceNumber, serviceNumber));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserAadhaarStatus(userId: number, aadhaarNumber: string, verified: boolean): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        aadhaarNumber,
        aadhaarVerified: verified,
        lastVerificationDate: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Enhanced Scheme methods
  async getSchemes(filters?: SchemeFilters): Promise<Scheme[]> {
    let query = db.select().from(schemes);

    if (filters) {
      const conditions = [];

      if (filters.category) {
        conditions.push(eq(schemes.category, filters.category));
      }

      if (filters.status) {
        conditions.push(eq(schemes.status, filters.status));
      }

      if (filters.isActive !== undefined) {
        conditions.push(eq(schemes.isActive, filters.isActive));
      }

      if (filters.search) {
        conditions.push(
          or(
            like(schemes.title, `%${filters.search}%`),
            like(schemes.description, `%${filters.search}%`)
          )
        );
      }

      if (filters.minAmount) {
        conditions.push(sql`${schemes.amount} >= ${filters.minAmount}`);
      }

      if (filters.maxAmount) {
        conditions.push(sql`${schemes.amount} <= ${filters.maxAmount}`);
      }

      if (filters.tags?.length) {
        conditions.push(sql`${schemes.tags} && ${filters.tags}`);
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
    }

    return await query.orderBy(desc(schemes.createdAt));
  }

  async getScheme(id: number): Promise<Scheme | undefined> {
    const [scheme] = await db.select().from(schemes).where(eq(schemes.id, id));
    return scheme;
  }

  async createScheme(insertScheme: InsertScheme): Promise<Scheme> {
    const [scheme] = await db.insert(schemes).values(insertScheme).returning();
    return scheme;
  }

  async updateScheme(id: number, update: SchemeUpdate, updatedBy: number): Promise<Scheme | undefined> {
    const [scheme] = await db
      .update(schemes)
      .set({
        ...update,
        lastUpdated: new Date(),
        updatedBy,
      })
      .where(eq(schemes.id, id))
      .returning();
    return scheme;
  }

  async deleteScheme(id: number): Promise<boolean> {
    const [scheme] = await db
      .update(schemes)
      .set({ isActive: false })
      .where(eq(schemes.id, id))
      .returning();
    return !!scheme;
  }

  async getSchemesByCategory(category: string): Promise<Scheme[]> {
    return await db
      .select()
      .from(schemes)
      .where(and(eq(schemes.category, category), eq(schemes.isActive, true)))
      .orderBy(desc(schemes.createdAt));
  }

  async getActiveSchemes(): Promise<Scheme[]> {
    return await db
      .select()
      .from(schemes)
      .where(
        and(
          eq(schemes.isActive, true),
          eq(schemes.status, "ACTIVE"),
          or(
            isNull(schemes.endDate),
            sql`${schemes.endDate} > NOW()`
          )
        )
      )
      .orderBy(desc(schemes.createdAt));
  }

  async getUpcomingSchemes(): Promise<Scheme[]> {
    return await db
      .select()
      .from(schemes)
      .where(
        and(
          eq(schemes.isActive, true),
          eq(schemes.status, "UPCOMING"),
          sql`${schemes.startDate} > NOW()`
        )
      )
      .orderBy(schemes.startDate);
  }

  async searchSchemes(query: string): Promise<Scheme[]> {
    return await db
      .select()
      .from(schemes)
      .where(
        and(
          eq(schemes.isActive, true),
          or(
            like(schemes.title, `%${query}%`),
            like(schemes.description, `%${query}%`),
            like(schemes.benefits, `%${query}%`),
            sql`${schemes.tags} @> ARRAY[${query}]`
          )
        )
      )
      .orderBy(desc(schemes.createdAt));
  }

  async getSchemeApplicationStats(schemeId: number): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }> {
    const [result] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        approved: sql<number>`SUM(CASE WHEN ${applications.status} = 'approved' THEN 1 ELSE 0 END)::int`,
        pending: sql<number>`SUM(CASE WHEN ${applications.status} = 'pending' THEN 1 ELSE 0 END)::int`,
        rejected: sql<number>`SUM(CASE WHEN ${applications.status} = 'rejected' THEN 1 ELSE 0 END)::int`,
      })
      .from(applications)
      .where(eq(applications.schemeId, schemeId));

    return {
      total: result?.total || 0,
      approved: result?.approved || 0,
      pending: result?.pending || 0,
      rejected: result?.rejected || 0,
    };
  }

  async incrementBeneficiaries(schemeId: number): Promise<void> {
    await db
      .update(schemes)
      .set({
        currentBeneficiaries: sql`${schemes.currentBeneficiaries} + 1`,
      })
      .where(eq(schemes.id, schemeId));
  }

  async decrementBeneficiaries(schemeId: number): Promise<void> {
    await db
      .update(schemes)
      .set({
        currentBeneficiaries: sql`${schemes.currentBeneficiaries} - 1`,
      })
      .where(eq(schemes.id, schemeId));
  }

  // Application methods
  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.appliedAt));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async updateApplicationStatus(id: number, status: string, reviewedBy?: number, comments?: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || null,
        comments: comments || null,
      })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  // Grievance methods
  async getGrievancesByUser(userId: number): Promise<Grievance[]> {
    return await db.select().from(grievances).where(eq(grievances.userId, userId));
  }

  async getAllGrievances(): Promise<Grievance[]> {
    return await db.select().from(grievances);
  }

  async createGrievance(insertGrievance: InsertGrievance): Promise<Grievance> {
    const [grievance] = await db.insert(grievances).values(insertGrievance).returning();
    return grievance;
  }

  async updateGrievanceStatus(id: number, status: string, resolvedBy?: number, resolution?: string): Promise<Grievance | undefined> {
    const [grievance] = await db
      .update(grievances)
      .set({
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
        resolvedBy: resolvedBy || null,
        resolution: resolution || null,
      })
      .where(eq(grievances.id, id))
      .returning();
    return grievance || undefined;
  }

  // SOS Alert methods
  async createSosAlert(insertSosAlert: InsertSosAlert): Promise<SosAlert> {
    const [sosAlert] = await db.insert(sosAlerts).values(insertSosAlert).returning();
    return sosAlert;
  }

  async getSosAlerts(): Promise<SosAlert[]> {
    return await db.select().from(sosAlerts);
  }

  async updateSosAlert(id: number, update: UpdateSosAlert): Promise<SosAlert | undefined> {
    const [alert] = await db
      .update(sosAlerts)
      .set(update)
      .where(eq(sosAlerts.id, id))
      .returning();
    return alert;
  }

  async getActiveSosAlerts(): Promise<SosAlert[]> {
    return await db
      .select()
      .from(sosAlerts)
      .where(isNull(sosAlerts.acknowledgedAt));
  }

  // Aadhaar Verification methods
  async createAadhaarVerificationLog(log: InsertAadhaarVerificationLog): Promise<AadhaarVerificationLog> {
    const [newLog] = await db
      .insert(aadhaarVerificationLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAadhaarVerificationLogs(userId: number): Promise<AadhaarVerificationLog[]> {
    return db
      .select()
      .from(aadhaarVerificationLogs)
      .where(eq(aadhaarVerificationLogs.userId, userId));
  }
}

export const storage = new DatabaseStorage();

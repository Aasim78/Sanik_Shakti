import { 
  User, InsertUser, 
  Scheme, InsertScheme,
  Application, InsertApplication,
  Grievance, InsertGrievance,
  SosAlert, InsertSosAlert,
  users, schemes, applications, grievances, sosAlerts
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByServiceNumber(serviceNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Scheme methods
  getSchemes(): Promise<Scheme[]>;
  getScheme(id: number): Promise<Scheme | undefined>;
  createScheme(scheme: InsertScheme): Promise<Scheme>;
  
  // Application methods
  getApplicationsByUser(userId: number): Promise<Application[]>;
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

  // Scheme methods
  async getSchemes(): Promise<Scheme[]> {
    return await db.select().from(schemes).where(eq(schemes.isActive, true));
  }

  async getScheme(id: number): Promise<Scheme | undefined> {
    const [scheme] = await db.select().from(schemes).where(eq(schemes.id, id));
    return scheme || undefined;
  }

  async createScheme(insertScheme: InsertScheme): Promise<Scheme> {
    const [scheme] = await db.insert(schemes).values(insertScheme).returning();
    return scheme;
  }

  // Application methods
  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
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
}

export const storage = new DatabaseStorage();

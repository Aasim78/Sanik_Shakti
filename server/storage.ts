import { 
  User, InsertUser, 
  Scheme, InsertScheme,
  Application, InsertApplication,
  Grievance, InsertGrievance,
  SosAlert, InsertSosAlert
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private schemes: Map<number, Scheme> = new Map();
  private applications: Map<number, Application> = new Map();
  private grievances: Map<number, Grievance> = new Map();
  private sosAlerts: Map<number, SosAlert> = new Map();
  
  private currentUserId = 1;
  private currentSchemeId = 1;
  private currentApplicationId = 1;
  private currentGrievanceId = 1;
  private currentSosAlertId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial schemes
    const schemes: InsertScheme[] = [
      {
        title: "Children Education Grant",
        description: "Financial assistance for children's education including school fees, books, and uniform expenses.",
        category: "education",
        amount: 25000,
        eligibility: "All service personnel",
        deadline: "March 31, 2024",
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
        deadline: "December 31, 2024",
        processingTime: "30-45 days",
        isActive: true,
      },
    ];

    schemes.forEach(scheme => {
      const id = this.currentSchemeId++;
      this.schemes.set(id, { 
        ...scheme, 
        id, 
        createdAt: new Date() 
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByServiceNumber(serviceNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.serviceNumber === serviceNumber);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Scheme methods
  async getSchemes(): Promise<Scheme[]> {
    return Array.from(this.schemes.values()).filter(scheme => scheme.isActive);
  }

  async getScheme(id: number): Promise<Scheme | undefined> {
    return this.schemes.get(id);
  }

  async createScheme(insertScheme: InsertScheme): Promise<Scheme> {
    const id = this.currentSchemeId++;
    const scheme: Scheme = { 
      ...insertScheme, 
      id, 
      createdAt: new Date() 
    };
    this.schemes.set(id, scheme);
    return scheme;
  }

  // Application methods
  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.userId === userId);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const application: Application = { 
      ...insertApplication, 
      id, 
      appliedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      comments: null,
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplicationStatus(id: number, status: string, reviewedBy?: number, comments?: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = {
      ...application,
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy || null,
      comments: comments || null,
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Grievance methods
  async getGrievancesByUser(userId: number): Promise<Grievance[]> {
    return Array.from(this.grievances.values()).filter(grievance => grievance.userId === userId);
  }

  async getAllGrievances(): Promise<Grievance[]> {
    return Array.from(this.grievances.values());
  }

  async createGrievance(insertGrievance: InsertGrievance): Promise<Grievance> {
    const id = this.currentGrievanceId++;
    const grievance: Grievance = { 
      ...insertGrievance, 
      id, 
      filedAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
    };
    this.grievances.set(id, grievance);
    return grievance;
  }

  async updateGrievanceStatus(id: number, status: string, resolvedBy?: number, resolution?: string): Promise<Grievance | undefined> {
    const grievance = this.grievances.get(id);
    if (!grievance) return undefined;
    
    const updatedGrievance = {
      ...grievance,
      status,
      resolvedAt: status === 'resolved' ? new Date() : null,
      resolvedBy: resolvedBy || null,
      resolution: resolution || null,
    };
    this.grievances.set(id, updatedGrievance);
    return updatedGrievance;
  }

  // SOS Alert methods
  async createSosAlert(insertSosAlert: InsertSosAlert): Promise<SosAlert> {
    const id = this.currentSosAlertId++;
    const sosAlert: SosAlert = { 
      ...insertSosAlert, 
      id, 
      sentAt: new Date(),
      acknowledgedAt: null,
      acknowledgedBy: null,
    };
    this.sosAlerts.set(id, sosAlert);
    return sosAlert;
  }

  async getSosAlerts(): Promise<SosAlert[]> {
    return Array.from(this.sosAlerts.values());
  }
}

export const storage = new MemStorage();

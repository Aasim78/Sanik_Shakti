import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertApplicationSchema, insertGrievanceSchema, insertSosAlertSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "sainik-saathi-secret-key";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

// Middleware to verify JWT token
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByServiceNumber(userData.serviceNumber);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          serviceNumber: user.serviceNumber,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
      }

      // Find user by email or service number
      const user = await storage.getUserByEmail(email) || 
                   await storage.getUserByServiceNumber(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify role
      if (user.role !== role) {
        return res.status(401).json({ message: "Invalid role selected" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          serviceNumber: user.serviceNumber,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        serviceNumber: user.serviceNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info", error });
    }
  });

  // Schemes routes
  app.get("/api/schemes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const schemes = await storage.getSchemes();
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get schemes", error });
    }
  });

  app.get("/api/schemes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scheme = await storage.getScheme(id);
      
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      res.json(scheme);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scheme", error });
    }
  });

  // Applications routes
  app.get("/api/applications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await storage.getApplicationsByUser(req.user!.id);
      
      // Get scheme details for each application
      const applicationsWithSchemes = await Promise.all(
        applications.map(async (app) => {
          const scheme = await storage.getScheme(app.schemeId);
          return { ...app, scheme };
        })
      );

      res.json(applicationsWithSchemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get applications", error });
    }
  });

  app.post("/api/applications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Check if scheme exists
      const scheme = await storage.getScheme(applicationData.schemeId);
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "Failed to create application", error });
    }
  });

  // Grievances routes
  app.get("/api/grievances", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const grievances = req.user!.role === 'admin' 
        ? await storage.getAllGrievances()
        : await storage.getGrievancesByUser(req.user!.id);
      
      res.json(grievances);
    } catch (error) {
      res.status(500).json({ message: "Failed to get grievances", error });
    }
  });

  app.post("/api/grievances", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const grievanceData = insertGrievanceSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const grievance = await storage.createGrievance(grievanceData);
      res.status(201).json(grievance);
    } catch (error) {
      res.status(400).json({ message: "Failed to create grievance", error });
    }
  });

  app.patch("/api/grievances/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, resolution } = req.body;

      // Only admins can update grievance status
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const grievance = await storage.updateGrievanceStatus(
        id, 
        status, 
        req.user!.id, 
        resolution
      );

      if (!grievance) {
        return res.status(404).json({ message: "Grievance not found" });
      }

      res.json(grievance);
    } catch (error) {
      res.status(400).json({ message: "Failed to update grievance", error });
    }
  });

  // SOS Alert routes
  app.post("/api/sos", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sosData = insertSosAlertSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const sosAlert = await storage.createSosAlert(sosData);
      res.status(201).json({
        message: "SOS alert sent successfully",
        alert: sosAlert,
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to send SOS alert", error });
    }
  });

  app.get("/api/sos", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only admins can view all SOS alerts
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const sosAlerts = await storage.getSosAlerts();
      res.json(sosAlerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get SOS alerts", error });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await storage.getApplicationsByUser(req.user!.id);
      const grievances = await storage.getGrievancesByUser(req.user!.id);

      const stats = {
        activeApplications: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        pending: applications.filter(app => app.status === 'pending').length,
        grievances: grievances.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

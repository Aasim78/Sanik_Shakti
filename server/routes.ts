import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AadhaarService } from "./services/aadhaar";
import { 
  insertUserSchema, 
  insertApplicationSchema, 
  insertGrievanceSchema, 
  insertSosAlertSchema,
  AadhaarVerificationRequest 
} from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { apiLimiter, authLimiter, aadhaarLimiter, sosLimiter } from "./middleware/rate-limit";
import { Server as SocketServer } from "socket.io";

const JWT_SECRET = process.env.JWT_SECRET || "sainik-saathi-secret-key";
const aadhaarService = new AadhaarService();

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

// Middleware to verify JWT token
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Fallback to cookie if no Authorization header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    const user = await storage.getUser(decoded.id);
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
  // Apply rate limiters
  app.use("/api/", apiLimiter);
  app.use("/api/auth/", authLimiter);
  app.use("/api/aadhaar/", aadhaarLimiter);
  app.use("/api/sos/", sosLimiter);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join admin room if user is admin
    socket.on("join-admin", (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
        if (decoded.role === "admin") {
          socket.join("admin-room");
        }
      } catch (error) {
        console.error("Invalid token for admin room");
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password, serviceNumber } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingServiceNumber = await storage.getUserByServiceNumber(serviceNumber);
      if (existingServiceNumber) {
        return res.status(400).json({ message: "Service number already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user with required fields only
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        serviceNumber,
        role: "soldier", // Default role
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Always false in dev for localhost
        sameSite: "lax", // Always lax in dev for localhost
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      res.status(201).json(userData);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Always false in dev for localhost
        sameSite: "lax", // Always lax in dev for localhost
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Enhanced Scheme routes
  app.get("/api/schemes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const filters = {
        category: req.query.category as string,
        status: req.query.status as string,
        search: req.query.search as string,
        minAmount: req.query.minAmount ? parseInt(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseInt(req.query.maxAmount as string) : undefined,
        isActive: req.query.isActive === "true",
        tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
      };

      const schemes = await storage.getSchemes(filters);
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get schemes", error });
    }
  });

  app.get("/api/schemes/active", authenticateToken, async (req: Request, res: Response) => {
    try {
      const schemes = await storage.getActiveSchemes();
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active schemes", error });
    }
  });

  app.get("/api/schemes/upcoming", authenticateToken, async (req: Request, res: Response) => {
    try {
      const schemes = await storage.getUpcomingSchemes();
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get upcoming schemes", error });
    }
  });

  app.get("/api/schemes/category/:category", authenticateToken, async (req: Request, res: Response) => {
    try {
      const schemes = await storage.getSchemesByCategory(req.params.category);
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get schemes by category", error });
    }
  });

  app.get("/api/schemes/search", authenticateToken, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const schemes = await storage.searchSchemes(query);
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search schemes", error });
    }
  });

  app.get("/api/schemes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scheme = await storage.getScheme(id);
      
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      // Get application stats for the scheme
      const stats = await storage.getSchemeApplicationStats(id);
      res.json({ ...scheme, stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to get scheme", error });
    }
  });

  app.post("/api/schemes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only admins can create schemes
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const scheme = await storage.createScheme(req.body);
      res.status(201).json(scheme);
    } catch (error) {
      res.status(400).json({ message: "Failed to create scheme", error });
    }
  });

  app.patch("/api/schemes/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only admins can update schemes
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const id = parseInt(req.params.id);
      const scheme = await storage.updateScheme(id, req.body, req.user!.id);

      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      res.json(scheme);
    } catch (error) {
      res.status(400).json({ message: "Failed to update scheme", error });
    }
  });

  app.delete("/api/schemes/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only admins can delete schemes
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteScheme(id);

      if (!success) {
        return res.status(404).json({ message: "Scheme not found" });
      }

      res.json({ message: "Scheme deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete scheme", error });
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

      // Emit SOS alert to admin room
      io.to("admin-room").emit("sos-alert", {
        ...sosAlert,
        user: await storage.getUser(sosAlert.userId),
      });

      // Send SMS/Email notifications to admins (implement this based on your notification service)
      // await notifyAdmins(sosAlert);

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

  app.patch("/api/sos/:id/acknowledge", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only admins can acknowledge alerts
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const alert = await storage.updateSosAlert(id, {
        acknowledgedAt: new Date(),
        acknowledgedBy: req.user!.id,
      });

      if (!alert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }

      // Notify the user that their alert was acknowledged
      io.emit(`sos-acknowledged-${alert.userId}`, {
        alertId: id,
        acknowledgedBy: await storage.getUser(req.user!.id),
      });

      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Failed to acknowledge SOS alert", error });
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

  // Aadhaar Verification Routes
  app.post("/api/aadhaar/initiate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const verificationRequest: AadhaarVerificationRequest = {
        aadhaarNumber: req.body.aadhaarNumber,
        verificationType: req.body.verificationType,
      };

      const response = await aadhaarService.initiateVerification(verificationRequest);
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/aadhaar/verify-otp", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const verificationRequest: AadhaarVerificationRequest = {
        aadhaarNumber: req.body.aadhaarNumber,
        otp: req.body.otp,
        txnId: req.body.txnId,
        verificationType: 'OTP',
      };

      const response = await aadhaarService.verifyOTP(verificationRequest);
      
      if (response.verified) {
        // Update user's Aadhaar status
        await storage.updateUserAadhaarStatus(
          req.user!.id,
          req.body.aadhaarNumber,
          true
        );
      }

      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/aadhaar/verify-biometric", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const verificationRequest: AadhaarVerificationRequest = {
        aadhaarNumber: req.body.aadhaarNumber,
        biometricData: req.body.biometricData,
        txnId: req.body.txnId,
        verificationType: 'BIOMETRIC',
      };

      const response = await aadhaarService.verifyBiometric(verificationRequest);
      
      if (response.verified) {
        // Update user's Aadhaar status
        await storage.updateUserAadhaarStatus(
          req.user!.id,
          req.body.aadhaarNumber,
          true
        );
      }

      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/aadhaar/verification-logs", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = await storage.getAadhaarVerificationLogs(req.user!.id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

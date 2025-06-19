import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertInteractionSchema, insertTenantSchema } from "@shared/schema";
import { z } from "zod";

// WebSocket clients for real-time updates
const wsClients = new Set<any>();

// In-memory alert store for prototype
const alerts: { type: string; message: string; timestamp: number }[] = [];

// Helper: Detect SQL injection patterns
function isSQLInjection(str: string) {
  const patterns = [
    /('|\").*\s*or\s*('|\").*=('|\").*/i,
    /union\s+select/i,
    /drop\s+table/i,
    /--/,
    /;.*--/, 
    /'\s*or\s*1=1/i,
    /'\s*or\s*'1'='1/i
  ];
  return patterns.some((re) => re.test(str));
}

// Helper: Track failed login attempts per IP
const failedLoginAttempts: Record<string, { count: number; last: number }> = {};
const CREDENTIAL_STUFFING_THRESHOLD = 5; // e.g., 5 attempts in 30s
const CREDENTIAL_STUFFING_WINDOW = 30 * 1000;

export async function registerRoutes(app: Express): Promise<Server> {
  // Create default tenant if none exists
  try {
    const tenants = await storage.getTenants();
    if (tenants.length === 0) {
      await storage.createTenant({
        name: "Default Organization",
        domain: "localhost",
        settings: { theme: "dark", notifications: true },
        isActive: true
      });
    }
  } catch (error) {
    console.log("Default tenant setup will be handled after database is ready");
  }

  // Tenant routes
  app.post("/api/tenants", async (req, res) => {
    try {
      const validatedData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(validatedData);
      res.json(tenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(400).json({ error: "Invalid tenant data" });
    }
  });

  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  // Log interaction endpoint with WebSocket broadcast
  app.post("/api/interactions", async (req, res) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const { type, data } = req.body;
      // Detect credential stuffing (rapid failed logins)
      if (type === 'login_failed') {
        const now = Date.now();
        if (!failedLoginAttempts[ip]) failedLoginAttempts[ip] = { count: 0, last: now };
        if (now - failedLoginAttempts[ip].last < CREDENTIAL_STUFFING_WINDOW) {
          failedLoginAttempts[ip].count++;
        } else {
          failedLoginAttempts[ip].count = 1;
        }
        failedLoginAttempts[ip].last = now;
        if (failedLoginAttempts[ip].count >= CREDENTIAL_STUFFING_THRESHOLD) {
          alerts.push({
            type: 'credential_stuffing',
            message: `Possible credential stuffing attack from IP ${ip}`,
            timestamp: now
          });
          failedLoginAttempts[ip].count = 0; // reset after alert
        }
      }
      // Detect SQL injection in login attempts
      if (type === 'login_attempt' && data) {
        const fields = [data.email, data.username, data.password].filter(Boolean);
        if (fields.some(isSQLInjection)) {
          alerts.push({
            type: 'sql_injection',
            message: `Possible SQL injection attempt detected in login from IP ${ip}`,
            timestamp: Date.now()
          });
        }
      }
      const validatedData = insertInteractionSchema.parse({
        ...req.body,
        ip,
      });
      const interaction = await storage.createInteraction(validatedData);
      
      // Broadcast to WebSocket clients
      const message = JSON.stringify({
        type: 'new_interaction',
        data: interaction
      });
      wsClients.forEach(client => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
      res.json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(400).json({ error: "Invalid interaction data" });
    }
  });

  // Endpoint to get current alerts
  app.get("/api/alerts", (req, res) => {
    res.json(alerts.slice(-10)); // last 10 alerts
  });

  // Get recent interactions
  app.get("/api/interactions", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const interactions = await storage.getInteractions(tenantId, limit);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  // Get interaction statistics
  app.get("/api/interactions/stats", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string;
      const stats = await storage.getInteractionStats(tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching interaction stats:", error);
      res.status(500).json({ error: "Failed to fetch interaction statistics" });
    }
  });

  // Advanced analytics endpoints
  app.get("/api/analytics/risk", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string;
      const riskAnalysis = await storage.getRiskAnalysis(tenantId);
      res.json(riskAnalysis);
    } catch (error) {
      console.error("Error fetching risk analysis:", error);
      res.status(500).json({ error: "Failed to fetch risk analysis" });
    }
  });

  app.get("/api/analytics/geo", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string;
      const geoAnalytics = await storage.getGeoAnalytics(tenantId);
      res.json(geoAnalytics);
    } catch (error) {
      console.error("Error fetching geo analytics:", error);
      res.status(500).json({ error: "Failed to fetch geo analytics" });
    }
  });

  // Generate analytics report
  app.post("/api/analytics/reports", async (req, res) => {
    try {
      const { tenantId, reportType, startDate, endDate } = req.body;
      const report = await storage.generateAnalyticsReport(
        tenantId,
        reportType,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate analytics report" });
    }
  });

  app.get("/api/analytics/reports", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string;
      const reports = await storage.getAnalyticsReports(tenantId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch analytics reports" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server on different path to avoid Vite conflicts
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws' // Use specific path for our WebSocket
  });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });
  
  return httpServer;
}

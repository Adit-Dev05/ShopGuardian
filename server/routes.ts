import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInteractionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Log interaction endpoint
  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse({
        ...req.body,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
      });
      
      const interaction = await storage.createInteraction(validatedData);
      res.json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(400).json({ error: "Invalid interaction data" });
    }
  });

  // Get recent interactions
  app.get("/api/interactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const interactions = await storage.getInteractions(limit);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  // Get interaction statistics
  app.get("/api/interactions/stats", async (req, res) => {
    try {
      const stats = await storage.getInteractionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching interaction stats:", error);
      res.status(500).json({ error: "Failed to fetch interaction statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

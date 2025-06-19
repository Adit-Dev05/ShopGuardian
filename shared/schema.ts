import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domain: text("domain").unique(),
  settings: jsonb("settings"), // JSON settings for tenant-specific configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  role: text("role").notNull().default("user"), // 'admin', 'user', 'viewer'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: text("type").notNull(), // 'login_attempt', 'form_focus', 'navigation_click', etc.
  data: jsonb("data"), // JSON data containing interaction details
  userAgent: text("user_agent"),
  url: text("url"),
  ip: text("ip"),
  sessionId: text("session_id"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  riskScore: real("risk_score").default(0), // Risk assessment score
  geoLocation: jsonb("geo_location"), // Geographic data
  fingerprint: text("fingerprint"), // Browser fingerprint
});

export const analyticsReports = pgTable("analytics_reports", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  reportType: text("report_type").notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  data: jsonb("data").notNull(), // Aggregated analytics data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const alertRules = pgTable("alert_rules", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  condition: jsonb("condition").notNull(), // Alert condition rules
  isActive: boolean("is_active").notNull().default(true),
  notificationChannels: jsonb("notification_channels"), // Email, Slack, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  tenantId: true,
  role: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  timestamp: true,
});

export const insertAnalyticsReportSchema = createInsertSchema(analyticsReports).omit({
  id: true,
  createdAt: true,
});

export const insertAlertRuleSchema = createInsertSchema(alertRules).omit({
  id: true,
  createdAt: true,
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;
export type InsertAnalyticsReport = z.infer<typeof insertAnalyticsReportSchema>;
export type AnalyticsReport = typeof analyticsReports.$inferSelect;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;
export type AlertRule = typeof alertRules.$inferSelect;

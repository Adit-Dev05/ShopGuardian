import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc, count, and, gte, lte, sql } from "drizzle-orm";
import { 
  users, 
  interactions, 
  tenants, 
  analyticsReports, 
  alertRules,
  type User, 
  type InsertUser, 
  type Interaction, 
  type InsertInteraction,
  type Tenant,
  type InsertTenant,
  type AnalyticsReport,
  type InsertAnalyticsReport
} from "@shared/schema";

let db: any;
let useInMemory = false;

try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool);
} catch (error) {
  console.log('PostgreSQL not available, falling back to in-memory storage');
  useInMemory = true;
}

export interface IStorage {
  // Tenant methods
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenants(): Promise<Tenant[]>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Interaction methods
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getInteractions(tenantId?: string, limit?: number): Promise<Interaction[]>;
  getInteractionsByType(type: string, tenantId?: string): Promise<Interaction[]>;
  getInteractionStats(tenantId?: string): Promise<{
    totalInteractions: number;
    loginAttempts: number;
    productViews: number;
    navigationClicks: number;
    formInteractions: number;
  }>;
  
  // Analytics methods
  generateAnalyticsReport(tenantId: string, reportType: string, startDate: Date, endDate: Date): Promise<AnalyticsReport>;
  getAnalyticsReports(tenantId: string): Promise<AnalyticsReport[]>;
  
  // Advanced analytics
  getRiskAnalysis(tenantId?: string): Promise<{
    highRiskIPs: string[];
    suspiciousPatterns: any[];
    threatScore: number;
  }>;
  
  getGeoAnalytics(tenantId?: string): Promise<{
    topCountries: { country: string; count: number }[];
    suspiciousLocations: any[];
  }>;
}

export class PostgreSQLStorage implements IStorage {
  // Tenant methods
  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.isActive, true));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Interaction methods
  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const [interaction] = await db.insert(interactions).values({
      ...insertInteraction,
      data: insertInteraction.data || {},
      riskScore: this.calculateRiskScore(insertInteraction),
    }).returning();
    return interaction;
  }

  async getInteractions(tenantId?: string, limit: number = 50): Promise<Interaction[]> {
    let query = db.select().from(interactions).orderBy(desc(interactions.timestamp)).limit(limit);
    
    if (tenantId) {
      query = query.where(eq(interactions.tenantId, tenantId)) as any;
    }
    
    return await query;
  }

  async getInteractionsByType(type: string, tenantId?: string): Promise<Interaction[]> {
    if (tenantId) {
      return await db.select().from(interactions)
        .where(and(eq(interactions.type, type), eq(interactions.tenantId, tenantId)));
    }
    
    return await db.select().from(interactions).where(eq(interactions.type, type));
  }

  async getInteractionStats(tenantId?: string): Promise<{
    totalInteractions: number;
    loginAttempts: number;
    productViews: number;
    navigationClicks: number;
    formInteractions: number;
  }> {
    const baseQuery = tenantId 
      ? db.select().from(interactions).where(eq(interactions.tenantId, tenantId))
      : db.select().from(interactions);

    const [totalResult] = await db.select({ count: count() }).from(interactions)
      .where(tenantId ? eq(interactions.tenantId, tenantId) : undefined);

    const [loginResult] = await db.select({ count: count() }).from(interactions)
      .where(tenantId 
        ? and(eq(interactions.type, 'login_attempt'), eq(interactions.tenantId, tenantId))
        : eq(interactions.type, 'login_attempt'));

    const [productResult] = await db.select({ count: count() }).from(interactions)
      .where(tenantId 
        ? and(eq(interactions.type, 'product_view'), eq(interactions.tenantId, tenantId))
        : eq(interactions.type, 'product_view'));

    const [navigationResult] = await db.select({ count: count() }).from(interactions)
      .where(tenantId 
        ? and(eq(interactions.type, 'navigation_click'), eq(interactions.tenantId, tenantId))
        : eq(interactions.type, 'navigation_click'));

    const [formResult] = await db.select({ count: count() }).from(interactions)
      .where(tenantId 
        ? and(sql`${interactions.type} LIKE 'form_%'`, eq(interactions.tenantId, tenantId))
        : sql`${interactions.type} LIKE 'form_%'`);

    return {
      totalInteractions: totalResult.count,
      loginAttempts: loginResult.count,
      productViews: productResult.count,
      navigationClicks: navigationResult.count,
      formInteractions: formResult.count,
    };
  }

  // Analytics methods
  async generateAnalyticsReport(tenantId: string, reportType: string, startDate: Date, endDate: Date): Promise<AnalyticsReport> {
    const interactionsInPeriod = await db.select().from(interactions)
      .where(and(
        eq(interactions.tenantId, tenantId),
        gte(interactions.timestamp, startDate),
        lte(interactions.timestamp, endDate)
      ));

    const uniqueIPs = new Set(interactionsInPeriod.map(i => i.ip).filter(ip => ip !== null));
    const reportData = {
      totalInteractions: interactionsInPeriod.length,
      uniqueIPs: uniqueIPs.size,
      topInteractionTypes: this.getTopInteractionTypes(interactionsInPeriod),
      riskDistribution: this.getRiskDistribution(interactionsInPeriod),
      hourlyActivity: this.getHourlyActivity(interactionsInPeriod),
    };

    const [report] = await db.insert(analyticsReports).values({
      tenantId,
      reportType,
      periodStart: startDate,
      periodEnd: endDate,
      data: reportData,
    }).returning();

    return report;
  }

  async getAnalyticsReports(tenantId: string): Promise<AnalyticsReport[]> {
    return await db.select().from(analyticsReports)
      .where(eq(analyticsReports.tenantId, tenantId))
      .orderBy(desc(analyticsReports.createdAt));
  }

  // Advanced analytics
  async getRiskAnalysis(tenantId?: string): Promise<{
    highRiskIPs: string[];
    suspiciousPatterns: any[];
    threatScore: number;
  }> {
    let query = db.select().from(interactions);
    if (tenantId) {
      query = query.where(eq(interactions.tenantId, tenantId)) as any;
    }

    const allInteractions = await query;
    const ipRiskMap = new Map<string, number>();

    // Calculate risk scores per IP
    allInteractions.forEach(interaction => {
      if (interaction.ip && interaction.riskScore) {
        const currentRisk = ipRiskMap.get(interaction.ip) || 0;
        ipRiskMap.set(interaction.ip, currentRisk + interaction.riskScore);
      }
    });

    const highRiskIPs = Array.from(ipRiskMap.entries())
      .filter(([_, risk]) => risk > 10)
      .map(([ip, _]) => ip);

    const suspiciousPatterns = this.detectSuspiciousPatterns(allInteractions);
    const threatScore = this.calculateOverallThreatScore(allInteractions);

    return {
      highRiskIPs,
      suspiciousPatterns,
      threatScore,
    };
  }

  async getGeoAnalytics(tenantId?: string): Promise<{
    topCountries: { country: string; count: number }[];
    suspiciousLocations: any[];
  }> {
    let query = db.select().from(interactions);
    if (tenantId) {
      query = query.where(eq(interactions.tenantId, tenantId)) as any;
    }

    const allInteractions = await query;
    const countryMap = new Map<string, number>();

    allInteractions.forEach(interaction => {
      if (interaction.geoLocation) {
        const geoData = interaction.geoLocation as any;
        const country = geoData.country || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      }
    });

    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      topCountries,
      suspiciousLocations: this.detectSuspiciousLocations(allInteractions),
    };
  }

  // Helper methods
  private calculateRiskScore(interaction: InsertInteraction): number {
    let risk = 0;
    
    if (interaction.type === 'login_attempt') risk += 5;
    if (interaction.type === 'product_view') risk += 2;
    if (interaction.type === 'navigation_click') risk += 1;
    if (interaction.type?.includes('form_')) risk += 3;
    
    // Add risk based on user agent patterns
    if (interaction.userAgent?.includes('bot') || interaction.userAgent?.includes('crawler')) {
      risk += 10;
    }
    
    return risk;
  }

  private getTopInteractionTypes(interactions: Interaction[]): { type: string; count: number }[] {
    const typeMap = new Map<string, number>();
    interactions.forEach(i => {
      typeMap.set(i.type, (typeMap.get(i.type) || 0) + 1);
    });
    
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getRiskDistribution(interactions: Interaction[]): { low: number; medium: number; high: number } {
    const distribution = { low: 0, medium: 0, high: 0 };
    
    interactions.forEach(i => {
      const risk = i.riskScore || 0;
      if (risk < 3) distribution.low++;
      else if (risk < 7) distribution.medium++;
      else distribution.high++;
    });
    
    return distribution;
  }

  private getHourlyActivity(interactions: Interaction[]): { hour: number; count: number }[] {
    const hourMap = new Map<number, number>();
    
    interactions.forEach(i => {
      const hour = new Date(i.timestamp).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    
    return Array.from(hourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);
  }

  private detectSuspiciousPatterns(interactions: Interaction[]): Array<{
    type: string;
    ip: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    const patterns: Array<{
      type: string;
      ip: string;
      count: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];
    
    // Pattern 1: Rapid fire interactions from same IP
    const ipActivityMap = new Map<string, Interaction[]>();
    interactions.forEach(i => {
      if (i.ip) {
        if (!ipActivityMap.has(i.ip)) ipActivityMap.set(i.ip, []);
        ipActivityMap.get(i.ip)!.push(i);
      }
    });
    
    ipActivityMap.forEach((activities, ip) => {
      if (activities.length > 50) {
        patterns.push({
          type: 'high_volume_activity',
          ip,
          count: activities.length,
          severity: 'high'
        });
      }
    });
    
    return patterns;
  }

  private calculateOverallThreatScore(interactions: Interaction[]): number {
    // Use only the last 50 interactions for threat score calculation
    const recent = interactions.slice(-50);
    const totalRisk = recent.reduce((sum, i) => sum + (i.riskScore || 0), 0);
    const avgRisk = totalRisk / Math.max(recent.length, 1);
    // Use a logarithmic scale to avoid sudden jumps
    const logScore = Math.log10(avgRisk + 1) * 40; // log10(1) = 0, log10(11) ~ 1, log10(101) ~ 2
    return Math.min(Math.round(logScore), 100);
  }

  private detectSuspiciousLocations(interactions: Interaction[]): any[] {
    // Implementation for detecting suspicious geographic patterns
    return [];
  }
}

// Hybrid storage implementation that falls back to in-memory when PostgreSQL fails
export class HybridStorage implements IStorage {
  private pgStorage: PostgreSQLStorage;
  private memStorage: MemStorage;
  private useMemory: boolean = false;

  constructor() {
    this.pgStorage = new PostgreSQLStorage();
    this.memStorage = new MemStorage();
  }

  private async tryPostgreSQL<T>(operation: () => Promise<T>): Promise<T> {
    if (this.useMemory) {
      throw new Error('Using in-memory storage');
    }

    try {
      return await operation();
    } catch (error) {
      console.log('PostgreSQL operation failed, switching to in-memory storage');
      this.useMemory = true;
      throw error;
    }
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.createTenant(tenant));
    } catch (error) {
      // Mock tenant for in-memory storage
      return {
        id: 'default-tenant',
        name: tenant.name,
        domain: tenant.domain,
        settings: tenant.settings,
        isActive: tenant.isActive ?? true,
        createdAt: new Date()
      };
    }
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getTenant(id));
    } catch (error) {
      return {
        id: 'default-tenant',
        name: 'Default Organization',
        domain: 'localhost',
        settings: {},
        isActive: true,
        createdAt: new Date()
      };
    }
  }

  async getTenants(): Promise<Tenant[]> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getTenants());
    } catch (error) {
      return [{
        id: 'default-tenant',
        name: 'Default Organization',
        domain: 'localhost',
        settings: {},
        isActive: true,
        createdAt: new Date()
      }];
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getUser(id));
    } catch (error) {
      return await this.memStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getUserByUsername(username));
    } catch (error) {
      return await this.memStorage.getUserByUsername(username);
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.createUser(user));
    } catch (error) {
      return await this.memStorage.createUser(user);
    }
  }

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.createInteraction(interaction));
    } catch (error) {
      return await this.memStorage.createInteraction(interaction);
    }
  }

  async getInteractions(tenantId?: string, limit?: number): Promise<Interaction[]> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getInteractions(tenantId, limit));
    } catch (error) {
      return await this.memStorage.getInteractions(limit);
    }
  }

  async getInteractionsByType(type: string, tenantId?: string): Promise<Interaction[]> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getInteractionsByType(type, tenantId));
    } catch (error) {
      return await this.memStorage.getInteractionsByType(type);
    }
  }

  async getInteractionStats(tenantId?: string): Promise<{
    totalInteractions: number;
    loginAttempts: number;
    productViews: number;
    navigationClicks: number;
    formInteractions: number;
  }> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getInteractionStats(tenantId));
    } catch (error) {
      return await this.memStorage.getInteractionStats();
    }
  }

  async generateAnalyticsReport(tenantId: string, reportType: string, startDate: Date, endDate: Date): Promise<AnalyticsReport> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.generateAnalyticsReport(tenantId, reportType, startDate, endDate));
    } catch (error) {
      // Mock analytics report for in-memory storage
      return {
        id: 1,
        tenantId,
        reportType,
        periodStart: startDate,
        periodEnd: endDate,
        data: { totalInteractions: 0, message: 'Using in-memory storage' },
        createdAt: new Date()
      };
    }
  }

  async getAnalyticsReports(tenantId: string): Promise<AnalyticsReport[]> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getAnalyticsReports(tenantId));
    } catch (error) {
      return [];
    }
  }

  async getRiskAnalysis(tenantId?: string): Promise<{
    highRiskIPs: string[];
    suspiciousPatterns: any[];
    threatScore: number;
  }> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getRiskAnalysis(tenantId));
    } catch (error) {
      const interactions = await this.memStorage.getInteractions();
      return {
        highRiskIPs: [],
        suspiciousPatterns: [],
        threatScore: Math.min(interactions.length * 2, 100)
      };
    }
  }

  async getGeoAnalytics(tenantId?: string): Promise<{
    topCountries: { country: string; count: number }[];
    suspiciousLocations: any[];
  }> {
    try {
      return await this.tryPostgreSQL(() => this.pgStorage.getGeoAnalytics(tenantId));
    } catch (error) {
      return {
        topCountries: [
          { country: 'United States', count: 15 },
          { country: 'Unknown', count: 8 }
        ],
        suspiciousLocations: []
      };
    }
  }
}

// In-memory storage fallback implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private interactions: Map<number, Interaction>;
  private currentUserId: number;
  private currentInteractionId: number;

  constructor() {
    this.users = new Map();
    this.interactions = new Map();
    this.currentUserId = 1;
    this.currentInteractionId = 1;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    return {
      id: 'default-tenant',
      name: tenant.name,
      domain: tenant.domain,
      settings: tenant.settings,
      isActive: tenant.isActive ?? true,
      createdAt: new Date()
    };
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return {
      id: 'default-tenant',
      name: 'Default Organization',
      domain: 'localhost',
      settings: {},
      isActive: true,
      createdAt: new Date()
    };
  }

  async getTenants(): Promise<Tenant[]> {
    return [{
      id: 'default-tenant',
      name: 'Default Organization',
      domain: 'localhost',
      settings: {},
      isActive: true,
      createdAt: new Date()
    }];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      tenantId: insertUser.tenantId || null,
      role: insertUser.role || 'user'
    };
    this.users.set(id, user);
    return user;
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = this.currentInteractionId++;
    const interaction: Interaction = {
      ...insertInteraction,
      id,
      timestamp: new Date(),
      data: insertInteraction.data || {},
      tenantId: insertInteraction.tenantId || null,
      riskScore: this.calculateRiskScore(insertInteraction),
      geoLocation: insertInteraction.geoLocation || null,
      fingerprint: insertInteraction.fingerprint || null,
    };
    this.interactions.set(id, interaction);
    return interaction;
  }

  async getInteractions(limit: number = 50): Promise<Interaction[]> {
    const allInteractions = Array.from(this.interactions.values());
    return allInteractions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getInteractionsByType(type: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(
      (interaction) => interaction.type === type
    );
  }

  async getInteractionStats(): Promise<{
    totalInteractions: number;
    loginAttempts: number;
    productViews: number;
    navigationClicks: number;
    formInteractions: number;
  }> {
    const allInteractions = Array.from(this.interactions.values());
    
    return {
      totalInteractions: allInteractions.length,
      loginAttempts: allInteractions.filter(i => i.type === 'login_attempt').length,
      productViews: allInteractions.filter(i => i.type === 'product_view').length,
      navigationClicks: allInteractions.filter(i => i.type === 'navigation_click').length,
      formInteractions: allInteractions.filter(i => i.type.includes('form_')).length,
    };
  }

  async generateAnalyticsReport(tenantId: string, reportType: string, startDate: Date, endDate: Date): Promise<AnalyticsReport> {
    return {
      id: 1,
      tenantId,
      reportType,
      periodStart: startDate,
      periodEnd: endDate,
      data: { totalInteractions: this.interactions.size },
      createdAt: new Date()
    };
  }

  async getAnalyticsReports(tenantId: string): Promise<AnalyticsReport[]> {
    return [];
  }

  async getRiskAnalysis(tenantId?: string): Promise<{
    highRiskIPs: string[];
    suspiciousPatterns: any[];
    threatScore: number;
  }> {
    return {
      highRiskIPs: [],
      suspiciousPatterns: [],
      threatScore: Math.min(this.interactions.size * 2, 100)
    };
  }

  async getGeoAnalytics(tenantId?: string): Promise<{
    topCountries: { country: string; count: number }[];
    suspiciousLocations: any[];
  }> {
    return {
      topCountries: [
        { country: 'United States', count: 15 },
        { country: 'Unknown', count: 8 }
      ],
      suspiciousLocations: []
    };
  }

  private calculateRiskScore(interaction: InsertInteraction): number {
    let risk = 0;
    
    if (interaction.type === 'login_attempt') risk += 5;
    if (interaction.type === 'product_view') risk += 2;
    if (interaction.type === 'navigation_click') risk += 1;
    if (interaction.type?.includes('form_')) risk += 3;
    
    return risk;
  }
}

export const storage = new HybridStorage();

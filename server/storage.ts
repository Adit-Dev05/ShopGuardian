import { users, interactions, type User, type InsertUser, type Interaction, type InsertInteraction } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Interaction methods
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getInteractions(limit?: number): Promise<Interaction[]>;
  getInteractionsByType(type: string): Promise<Interaction[]>;
  getInteractionStats(): Promise<{
    totalInteractions: number;
    loginAttempts: number;
    productViews: number;
    navigationClicks: number;
    formInteractions: number;
  }>;
}

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = this.currentInteractionId++;
    const interaction: Interaction = {
      ...insertInteraction,
      id,
      timestamp: new Date(),
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
}

export const storage = new MemStorage();

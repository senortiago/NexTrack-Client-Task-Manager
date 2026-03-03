import { db } from "./db";
import {
  clients, projects, tasks, charges,
  type InsertClient, type Client,
  type InsertProject, type Project,
  type InsertTask, type Task,
  type InsertCharge, type Charge
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<void>;

  // Projects
  getProjects(clientId?: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;

  // Tasks
  getTasks(projectId?: number, parentId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Charges
  getCharges(projectId?: number, taskId?: number): Promise<Charge[]>;
  getCharge(id: number): Promise<Charge | undefined>;
  createCharge(charge: InsertCharge): Promise<Charge>;
  updateCharge(id: number, updates: Partial<InsertCharge>): Promise<Charge | undefined>;
  deleteCharge(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Projects
  async getProjects(clientId?: number): Promise<Project[]> {
    if (clientId !== undefined) {
      return await db.select().from(projects).where(eq(projects.clientId, clientId));
    }
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Tasks
  async getTasks(projectId?: number, parentId?: number): Promise<Task[]> {
    let query = db.select().from(tasks).$dynamic();
    
    if (projectId !== undefined && parentId !== undefined) {
      query = query.where(and(eq(tasks.projectId, projectId), eq(tasks.parentId, parentId)));
    } else if (projectId !== undefined) {
      query = query.where(eq(tasks.projectId, projectId));
    } else if (parentId !== undefined) {
      query = query.where(eq(tasks.parentId, parentId));
    }
    
    return await query;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Charges
  async getCharges(projectId?: number, taskId?: number): Promise<Charge[]> {
    let query = db.select().from(charges).$dynamic();
    
    if (projectId !== undefined && taskId !== undefined) {
      query = query.where(and(eq(charges.projectId, projectId), eq(charges.taskId, taskId)));
    } else if (projectId !== undefined) {
      query = query.where(eq(charges.projectId, projectId));
    } else if (taskId !== undefined) {
      query = query.where(eq(charges.taskId, taskId));
    }
    
    return await query;
  }

  async getCharge(id: number): Promise<Charge | undefined> {
    const [charge] = await db.select().from(charges).where(eq(charges.id, id));
    return charge;
  }

  async createCharge(charge: InsertCharge): Promise<Charge> {
    const [newCharge] = await db.insert(charges).values(charge).returning();
    return newCharge;
  }

  async updateCharge(id: number, updates: Partial<InsertCharge>): Promise<Charge | undefined> {
    const [updatedCharge] = await db.update(charges).set(updates).where(eq(charges.id, id)).returning();
    return updatedCharge;
  }

  async deleteCharge(id: number): Promise<void> {
    await db.delete(charges).where(eq(charges.id, id));
  }
}

export const storage = new DatabaseStorage();

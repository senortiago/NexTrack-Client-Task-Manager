import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('active'), // active, completed
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  parentId: integer("parent_id"), // for subtasks
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default('todo'), // todo, in_progress, done
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const charges = sqliteTable("charges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  taskId: integer("task_id"), 
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  discountPercentage: integer("discount_percentage").notNull().default(0), // 0-100
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chargeId: integer("charge_id").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  paidAt: text("paid_at").default(sql`(datetime('now'))`),
  note: text("note"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  tasks: many(tasks),
  charges: many(charges),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: "subtasks",
  }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  charges: many(charges),
}));

export const chargesRelations = relations(charges, ({ one, many }) => ({
  project: one(projects, {
    fields: [charges.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [charges.taskId],
    references: [tasks.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  charge: one(charges, {
    fields: [payments.chargeId],
    references: [charges.id],
  }),
}));

// Schemas
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertChargeSchema = createInsertSchema(charges).omit({ id: true, createdAt: true }).extend({
  amount: z.coerce.number().int().min(0, "Amount must be a positive integer (in cents)"),
  discountPercentage: z.coerce.number().int().min(0).max(100).default(0),
});
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true }).extend({
  amount: z.coerce.number().int().min(1, "Amount must be a positive integer (in cents)"),
  paidAt: z.string().optional(),
  note: z.string().optional(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Charge = typeof charges.$inferSelect;
export type InsertCharge = z.infer<typeof insertChargeSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;


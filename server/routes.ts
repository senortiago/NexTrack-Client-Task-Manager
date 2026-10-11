import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Clients
  app.get(api.clients.list.path, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, async (req, res) => {
    const client = await storage.getClient(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  });

  app.post(api.clients.create.path, async (req, res) => {
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, async (req, res) => {
    try {
      const input = api.clients.update.input.parse(req.body);
      const client = await storage.updateClient(Number(req.params.id), input);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.clients.delete.path, async (req, res) => {
    await storage.deleteClient(Number(req.params.id));
    res.status(204).end();
  });

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    try {
      const input = api.projects.list.input?.parse(req.query) || {};
      const projects = await storage.getProjects(input.clientId);
      res.json(projects);
    } catch (err) {
      res.status(400).json({ message: 'Invalid query parameters' });
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.projects.update.path, async (req, res) => {
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    await storage.deleteProject(Number(req.params.id));
    res.status(204).end();
  });

  // Tasks
  app.get(api.tasks.list.path, async (req, res) => {
    try {
      const input = api.tasks.list.input?.parse(req.query) || {};
      const tasks = await storage.getTasks(input.projectId, input.parentId);
      res.json(tasks);
    } catch (err) {
      res.status(400).json({ message: 'Invalid query parameters' });
    }
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).end();
  });

  // Charges
  app.get(api.charges.list.path, async (req, res) => {
    try {
      const input = api.charges.list.input?.parse(req.query) || {};
      const charges = await storage.getCharges(input.projectId, input.taskId);
      res.json(charges);
    } catch (err) {
      res.status(400).json({ message: 'Invalid query parameters' });
    }
  });

  app.post(api.charges.create.path, async (req, res) => {
    try {
      const input = api.charges.create.input.parse(req.body);
      const charge = await storage.createCharge(input);
      res.status(201).json(charge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.charges.update.path, async (req, res) => {
    try {
      const input = api.charges.update.input.parse(req.body);
      const charge = await storage.updateCharge(Number(req.params.id), input);
      if (!charge) {
        return res.status(404).json({ message: 'Charge not found' });
      }
      res.json(charge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.charges.delete.path, async (req, res) => {
    await storage.deleteCharge(Number(req.params.id));
    res.status(204).end();
  });

  // Payments
  app.get(api.payments.list.path, async (req, res) => {
    try {
      const input = api.payments.list.input?.parse(req.query) || {};
      const payments = await storage.getPayments(input.chargeId);
      res.json(payments);
    } catch (err) {
      res.status(400).json({ message: 'Invalid query parameters' });
    }
  });

  app.post(api.payments.create.path, async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.payments.delete.path, async (req, res) => {
    await storage.deletePayment(Number(req.params.id));
    res.status(204).end();
  });

  // Seed data function to populate initial values if empty
  const clientsList = await storage.getClients();
  if (clientsList.length === 0) {
    const acme = await storage.createClient({ name: "Acme Corp", email: "contact@acme.com", company: "Acme Corporation" });
    const globex = await storage.createClient({ name: "Globex Inc", email: "info@globex.com", company: "Globex" });
    
    const project1 = await storage.createProject({ clientId: acme.id, name: "Website Redesign", description: "Full revamp of corporate website", status: "active" });
    const project2 = await storage.createProject({ clientId: globex.id, name: "Mobile App MVP", description: "Initial release of customer portal app", status: "active" });

    const task1 = await storage.createTask({ projectId: project1.id, title: "Design Mockups", description: "Figma designs for desktop and mobile", status: "in_progress" });
    const task2 = await storage.createTask({ projectId: project1.id, parentId: task1.id, title: "Mobile Nav", description: "Design mobile hamburger menu", status: "done" });
    const task3 = await storage.createTask({ projectId: project2.id, title: "Setup API", description: "Initialize backend services", status: "todo" });

    const charge1 = await storage.createCharge({ projectId: project1.id, taskId: task1.id, description: "Homepage Design", amount: 50000, discountPercentage: 10 }); // $500, 10% off ($450 net)
    const charge2 = await storage.createCharge({ projectId: project1.id, description: "Server Setup", amount: 15000, discountPercentage: 0 }); // $150
    await storage.createCharge({ projectId: project2.id, taskId: task3.id, description: "Database Provisioning", amount: 30000, discountPercentage: 100 }); // $300, 100% off

    await storage.createPayment({ chargeId: charge1.id, amount: 25000, note: "Wire Transfer (Deposit)" });
    await storage.createPayment({ chargeId: charge2.id, amount: 15000, note: "Stripe Online Payment" });
  } else {
    // If charges exist but payments are empty, seed initial payments
    const paymentsList = await storage.getPayments();
    if (paymentsList.length === 0) {
      const chargesList = await storage.getCharges();
      if (chargesList.length > 0) {
        await storage.createPayment({ chargeId: chargesList[0].id, amount: 25000, note: "Wire Transfer (Deposit)" });
        if (chargesList.length > 1) {
          await storage.createPayment({ chargeId: chargesList[1].id, amount: 15000, note: "Stripe Online Payment" });
        }
      }
    }
  }

  return httpServer;
}

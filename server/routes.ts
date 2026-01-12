import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // AI Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === DASHBOARD ===
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const { search, category } = req.query as any;
    const products = await storage.getProducts(search, category);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === ORDERS ===
  app.get(api.orders.list.path, async (req, res) => {
    const { status, search } = req.query as any;
    const orders = await storage.getOrders(search, status);
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post(api.orders.sync.path, async (req, res) => {
    try {
      // Mock sync logic
      // In a real app, this would fetch from Flipkart API
      await seedDatabase(); // For demo, we just ensure seed data exists
      res.json({ message: "Sync successful", syncedCount: 3 });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ message: "Sync failed" });
    }
  });

  app.post(api.orders.generateInvoice.path, async (req, res) => {
    try {
      const order = await storage.getOrder(Number(req.params.id));
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      // Return a dummy PDF url
      res.json({ url: "/invoice_placeholder.pdf" });
    } catch (error) {
      console.error("Invoice generation error:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  app.post(api.orders.bulkUpdateStatus.path, async (req, res) => {
    try {
      const { ids, status } = api.orders.bulkUpdateStatus.input.parse(req.body);
      const count = await storage.bulkUpdateOrdersStatus(ids, status);
      res.json({ success: true, count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Bulk update failed" });
    }
  });

  // === RETURNS ===
  app.get(api.returns.list.path, async (req, res) => {
    const returns = await storage.getReturns();
    res.json(returns);
  });

  // === SETTINGS ===
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === INTELLIGENCE ===
  app.get(api.intelligence.suggestions.path, async (req, res) => {
    // Mock suggestions
    res.json([
      { type: 'stock', message: 'Low stock warning for "Wireless Earbuds"', priority: 'high', productId: 1 },
      { type: 'rto', message: 'High return rate detected for "Smart Watch X1" in region North', priority: 'medium', productId: 2 },
      { type: 'pricing', message: 'Consider lowering price of "Phone Case" by 5% to match competitors', priority: 'low', productId: 3 },
    ]);
  });
  
  // Seed on startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    // Create Products
    const p1 = await storage.createProduct({
      name: "Wireless Earbuds",
      sku: "AUDIO-001",
      price: "1499.00",
      stock: 50,
      category: "Electronics",
      description: "High quality wireless earbuds with noise cancellation"
    });
    
    const p2 = await storage.createProduct({
      name: "Smart Watch X1",
      sku: "WEAR-001",
      price: "2999.00",
      stock: 10, // Low stock
      category: "Electronics",
      description: "Smart watch with health tracking"
    });
    
    const p3 = await storage.createProduct({
      name: "Phone Case - iPhone 14",
      sku: "ACC-001",
      price: "499.00",
      stock: 100,
      category: "Accessories",
      description: "Durable phone case"
    });

    // Create Orders
    await storage.createOrder({
      orderId: "OD1234567890",
      orderDate: new Date(),
      status: "CREATED",
      buyerName: "Rahul Sharma",
      buyerAddress: "123 MG Road, Bangalore, KA",
      totalAmount: "1499.00",
      shippingFee: "40.00",
    }, [{ sku: "AUDIO-001", quantity: 1, price: "1499.00" }]);
    
    await storage.createOrder({
      orderId: "OD9876543210",
      orderDate: new Date(Date.now() - 86400000), // Yesterday
      status: "PACKED",
      buyerName: "Priya Singh",
      buyerAddress: "45 Park Street, Kolkata, WB",
      totalAmount: "2999.00",
      shippingFee: "0.00",
    }, [{ sku: "WEAR-001", quantity: 1, price: "2999.00" }]);

    // Create Settings
    await storage.updateSettings({
      sellerName: "TechGadgets India",
      sellerAddress: "Bangalore, India",
      isSandbox: true,
    });
  }
}

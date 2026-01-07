import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Re-export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

// === PRODUCTS / INVENTORY ===
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  imageUrl: text("image_url"),
  flipkartProductId: text("flipkart_product_id"),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// === ORDERS ===
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(), // Flipkart Order ID
  orderDate: timestamp("order_date").notNull(),
  status: text("status").notNull(), // CREATED, PACKED, SHIPPED, DELIVERED, CANCELLED
  buyerName: text("buyer_name"),
  buyerAddress: text("buyer_address"), // Simplified for now
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"), // Flipkart commission
  gst: decimal("gst", { precision: 10, scale: 2 }).default("0"),
  dispatchByDate: timestamp("dispatch_by_date"),
  trackingId: text("tracking_id"),
  courierName: text("courier_name"),
  invoiceUrl: text("invoice_url"),
  packingSlipUrl: text("packing_slip_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  sku: text("sku").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// === RETURNS ===
export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  returnId: text("return_id").notNull(),
  reason: text("reason"),
  type: text("type"), // RTO, CUSTOMER_RETURN
  status: text("status"), // REQUESTED, APPROVED, RECEIVED, REJECTED
  trackingId: text("tracking_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReturnSchema = createInsertSchema(returns).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;

// === SETTINGS ===
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  sellerName: text("seller_name").notNull(),
  sellerAddress: text("seller_address"),
  gstin: text("gstin"),
  logoUrl: text("logo_url"),
  flipkartClientId: text("flipkart_client_id"), // Encrypt in real app
  flipkartClientSecret: text("flipkart_client_secret"), // Encrypt in real app
  isSandbox: boolean("is_sandbox").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ 
  id: true, 
  updatedAt: true 
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;


// === TYPES ===
// Extended types for API
export type OrderWithItems = Order & { items: (typeof orderItems.$inferSelect)[] };
export type DashboardStats = {
  totalOrders: number;
  pendingDispatch: number;
  totalSales: number;
  lowStockCount: number;
  returnsCount: number;
};

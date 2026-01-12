import { 
  products, orders, orderItems, returns, settings,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Return, type InsertReturn,
  type Settings, type InsertSettings,
  type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(search?: string, category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  
  // Orders
  getOrders(search?: string, status?: string): Promise<Order[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: { sku: string, quantity: number, price: string }[]): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;
  bulkUpdateOrdersStatus(ids: number[], status: string): Promise<number>;
  
  // Returns
  getReturns(): Promise<Return[]>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    totalOrders: number;
    pendingDispatch: number;
    totalSales: number;
    lowStockCount: number;
    returnsCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [];
    
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }
    
    if (category) {
      conditions.push(eq(products.category, category));
    }
    
    if (conditions.length > 0) {
      // @ts-ignore - simple condition logic
      return await query.where(sql`${sql.join(conditions, sql` AND `)}`);
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async getOrders(search?: string, status?: string): Promise<Order[]> {
    let query = db.select().from(orders).orderBy(desc(orders.orderDate));
    // Simplified filtering for now
    if (status) {
      return await query.where(eq(orders.status, status));
    }
    return await query;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async createOrder(insertOrder: InsertOrder, items: { sku: string, quantity: number, price: string }[]): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    
    // Insert items
    // First find product IDs by SKU
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.sku, item.sku));
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: product?.id, // Optional link
        sku: item.sku,
        quantity: item.quantity,
        price: item.price
      });
      
      // Update stock
      if (product) {
        await db.update(products)
          .set({ stock: (product.stock || 0) - item.quantity })
          .where(eq(products.id, product.id));
      }
    }
    
    return order;
  }
  
  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
     const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
     return updated;
  }

  async bulkUpdateOrdersStatus(ids: number[], status: string): Promise<number> {
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(sql`${orders.id} IN (${sql.join(ids, sql`, `)})`)
      .returning();
    return result.length;
  }

  async getReturns(): Promise<Return[]> {
    return await db.select().from(returns).orderBy(desc(returns.createdAt));
  }

  async getSettings(): Promise<Settings | undefined> {
    // Return the first settings row
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db.update(settings).set(insertSettings).where(eq(settings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(insertSettings).returning();
      return created;
    }
  }

  async getDashboardStats() {
    try {
      const [ordersCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
      const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'PACKED'));
      const [salesSum] = await db.select({ total: sql<string>`sum(${orders.totalAmount})` }).from(orders);
      const [lowStock] = await db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} <= ${products.lowStockThreshold}`);
      const [returnsC] = await db.select({ count: sql<number>`count(*)` }).from(returns);

      return {
        totalOrders: Number(ordersCount?.count || 0),
        pendingDispatch: Number(pendingCount?.count || 0),
        totalSales: parseFloat(salesSum?.total || "0"),
        lowStockCount: Number(lowStock?.count || 0),
        returnsCount: Number(returnsC?.count || 0),
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return {
        totalOrders: 0,
        pendingDispatch: 0,
        totalSales: 0,
        lowStockCount: 0,
        returnsCount: 0,
      };
    }
  }
}

export const storage = new DatabaseStorage();

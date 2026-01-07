import { z } from 'zod';
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertReturnSchema, 
  insertSettingsSchema,
  products,
  orders,
  returns,
  settings,
  orderItems
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalOrders: z.number(),
          pendingDispatch: z.number(),
          totalSales: z.number(),
          lowStockCount: z.number(),
          returnsCount: z.number(),
        }),
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      input: z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.custom<typeof orders.$inferSelect & { items: typeof orderItems.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    sync: {
      method: 'POST' as const,
      path: '/api/orders/sync',
      responses: {
        200: z.object({ message: z.string(), syncedCount: z.number() }),
      },
    },
    generateInvoice: {
      method: 'POST' as const,
      path: '/api/orders/:id/invoice',
      responses: {
        200: z.object({ url: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  returns: {
    list: {
      method: 'GET' as const,
      path: '/api/returns',
      responses: {
        200: z.array(z.custom<typeof returns.$inferSelect>()),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        404: errorSchemas.notFound, // If not initialized
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings',
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  // Add AI routes here if needed, but integration handles chat routes mostly.
  // We can add a route for "Seller Intelligence" suggestions
  intelligence: {
    suggestions: {
      method: 'GET' as const,
      path: '/api/intelligence/suggestions',
      responses: {
        200: z.array(z.object({
          type: z.enum(['pricing', 'stock', 'rto']),
          message: z.string(),
          priority: z.enum(['high', 'medium', 'low']),
          productId: z.number().optional(),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

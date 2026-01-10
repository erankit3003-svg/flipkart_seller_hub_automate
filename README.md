# Flipkart Seller Hub API Automation Software

A production-ready SaaS platform designed for Flipkart sellers to automate order handling, inventory control, invoicing, analytics, and returns.

## 🚀 Features

- **Authentication**: Secure token-based authentication using Replit Auth (OIDC).
- **Order Management**: Auto-fetch orders and track lifecycle (CREATED → PACKED → SHIPPED → DELIVERED).
- **Inventory Control**: Real-time stock tracking, low-stock alerts, and auto-deduction.
- **Returns Tracking**: Monitor RTO (Return to Origin) and customer returns with reason analysis.
- **Analytics Dashboard**: Daily/weekly/monthly sales reports and product-wise profit calculation.
- **Seller Intelligence**: AI-powered suggestions for price optimization and high-RTO risk detection.
- **Automated Invoicing**: GST-compliant invoice and packing slip generation (Mocked).

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI, TanStack Query.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **AI**: OpenAI (via Replit AI Integrations).

## 🔐 How to Connect with Flipkart

To connect this software to your real Flipkart Seller Hub account, follow these steps:

### 1. Register as a Developer
- Go to the [Flipkart Seller Hub API Portal](https://seller.flipkart.com/api-docs/).
- Register your application to obtain a `Client ID` and `Client Secret`.

### 2. Configure Settings
- Navigate to the **Settings** page in this application.
- Enter your Flipkart `Client ID` and `Client Secret`.
- Toggle between **Sandbox** (for testing) and **Production** environments.

### 3. API Integration Layer
- The backend API service layer is located in `server/routes.ts`.
- The `Sync Orders` button triggers the `/api/orders/sync` endpoint.
- To implement actual syncing, update the `sync` route in `server/routes.ts` to call the [Flipkart Order Management APIs](https://seller.flipkart.com/api-docs/oms).

### 4. Authentication Flow
- Use the `Client ID` and `Secret` to generate an OAuth token from Flipkart's auth endpoint (`https://api.flipkart.net/oauth-service/oauth/token`).
- Store the token securely and handle refresh logic in `server/storage.ts`.

## 📦 Deployment

This app is designed to be deployed on Replit.
1. Ensure all environment variables (like `DATABASE_URL`) are configured.
2. Run `npm run db:push` to set up your database schema.
3. Click the **Publish** button on Replit to go live.

## 📝 Project Structure

- `client/`: React frontend application.
- `server/`: Express backend and database logic.
- `shared/`: Shared Zod schemas and API route definitions.
- `shared/schema.ts`: Database table definitions.
- `shared/routes.ts`: Centralized API contract.

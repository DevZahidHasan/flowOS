# ⚡ FlowOS

> **The AI-Powered Business Operating System for Modern Service Businesses**

FlowOS is a premium, multi-tenant SaaS workspace platform designed to manage and automate business operations for service providers (salons, clinics, repair centers, coaching academies, and more). Built with a state-of-the-art tech stack and a sleek, mobile-first glassmorphic UI shell, it integrates client scheduling, CRM, tasks, invoicing, billing, AI automation, and cash-flow intelligence into a single dashboard.

---

## 🌟 Key Modules & Features

### 📅 1. Appointments & Scheduling
* **Interactive Booking Calendar:** Live filtering by schedule status (`Active`, `Walk-ins`, `Completed`, `Cancelled`).
* **Slide-over Booking Form:** Quick client check-in, duration buffer tags, and walk-in toggle.
* **Status Lifecycles:** Seamless progression from Scheduled ➔ In Progress ➔ Completed / Cancelled.

### 🎟️ 2. Queue Management
* **Ticket Generation:** Automate ticket sequencing (`#Q-101`, `#Q-102`) for walk-ins.
* **Now Serving Display:** Real-time waiting list, live serve board, sound/bell call notifications.

### 👥 3. Customer CRM & Relationship Logs
* **Customer Profiles:** Real-time counters tracking visit frequency, referral channels, loyalty points, and lifetime spending.
* **Timeline Activity:** Automated logs recording CRM events (Note creation, Customer creation, Invoiced dates).
* **Internal Roster Notes:** Secure client cards for internal staff annotations.

### 👨‍💼 4. Staff Directory & Rosters
* ** Roster Directory:** Status toggles (`Active`/`Inactive`), job titles, and job specialties.
* **Commissions Tracking:** Individual commission percentage rates linked to service revenue.

### 💼 5. Services & Pricing Catalog
* **Pricing Tiers:** Fixed and variable durations, category groups, buffer/prep times, and color codes.

### 💳 6. Invoicing & Billing
* **Invoice Wizard:** Add catalog services, apply percentage discounts, tax rates, and compute auto-totals.
* **Printable Receipts:** Beautiful clean layouts ready to export to PDF receipts.
* **Lifecycle States:** Invoice tracking (`Draft`, `Sent`, `Partially Paid`, `Paid`, `Cancelled`, `Refunded`).

### ✅ 7. Universal Task Management
* **KPI Trackers:** Glassmorphic metric cards (Total, To Do, In Progress, Overdue, Completed).
* **Dense Row Layout:** Support for persistable List-view rows vs Card layouts.
* **Task Lifecycles:** Standalone trash and archiving states separate from delete.
* **Bulk Operations Bar:** Complete, archive, delete, or change priorities of multiple tasks in one click.

### 🤖 8. AI Business Assistant (Powered by Groq Llama 3.3)
* **AI Service Builder:** Imports custom catalog packages from service keyword suggestions.
* **AI Client Care Planner:** Generates custom post-service guidelines, warning lists, and follow-up alerts.
* **AI Copywriter:** Generates marketing taglines, caption copies, and social hashtags.
* **AI Task Extractor:** Parses natural meeting text notes into actionable tasks.

### 📊 9. Finance & Profitability
* **Cash Flow Trend:** Native, responsive SVG chart comparing daily/monthly Revenue inflow vs Expense outflow.
* **Breakdown Analytics:** Automatic aggregation showing revenue shares by Customer (billing accounts), Service catalog items, and Staff contributions.
* **Operational Expense Log:** Categorized expense manager (Rent, Salaries, utilities) with soft-delete archiving.
* **Intelligence Health Insights:** Context-based recommendations (receivables alerts, profit warnings, rate optimizations).

---

## 🛠️ Tech Stack & Architecture

FlowOS utilizes a premium, modular, and type-safe software architecture:

* **Framework:** Next.js 15 (App Router) & React 19.
* **Database:** Supabase PostgreSQL with Row Level Security (RLS) for absolute multi-tenant data isolation.
* **Type Safety:** TypeScript configured with `strict: true` (ZERO `any` usage).
* **Design System:** Vanilla Tailwind CSS + shadcn/ui components customized with a Glassmorphic dark theme.
* **Forms & Validation:** React Hook Form + Zod resolvers.
* **Architecture Pattern:** `Repository ➔ Service ➔ Server Action` pattern separating database operations, business rules, and UI entry.
* **Design Patterns:** Custom `Result<T>` and `AppError` wrapping for clean, crash-proof error handling.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js v18.x or higher
* npm v10.x or higher
* A Supabase project instance

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
```

### 3. Database Migration
Run the SQL scripts in order inside your Supabase project's SQL editor:
1. `supabase/migrations/20260804000000_core_schema.sql` (Core tables, workspace, auth handle trigger)
2. `supabase/migrations/20260805000000_tasks_refactor.sql` (Universal task features)
3. `supabase/migrations/20260808000000_finance_expenses.sql` (Finance & expense tables, RLS)

### 4. Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Check TypeScript compilations
npx tsc --noEmit

# Build production server
npm run build
```

---

## 📂 Codebase Directory Layout

```text
src/
├── app/                  # Next.js App Router pages, layout shells, and routes
├── components/           # Reusable UI widgets and shadcn design system
├── features/             # Feature domains (Auth, CRM, Invoices, Tasks, Finance, AI)
│   ├── [feature]/
│   │   ├── actions/      # Next.js Server Actions (entry & membership checks)
│   │   ├── components/   # Feature-specific client views, forms, sheets
│   │   ├── repositories/ # Database query mappings & Supabase interfaces
│   │   ├── services/     # Core domain business logic & calculations
│   │   └── types/        # TypeScript models and Zod validation schemas
├── hooks/                # Global React hooks
├── lib/                  # Shared utilities (Result, AppError, Supabase Client wrappers)
└── types/                # Global database mapping declarations
```

---

## 🔒 Security & Data Isolation (Multi-Tenancy)
* **RLS Policies:** Every single query automatically asserts `workspace_id` isolation. A tenant from workspace A can **never** query, modify, or insert data belonging to workspace B.
* **Server Action Guards:** All server actions call an internal `verifyWorkspaceMembership` routine ensuring the authenticated user belongs to the active tenant workspace before execution.

---

## 📄 License
FlowOS is proprietary software. All rights reserved © 2026.

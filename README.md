# TradeLog — Trading Journal & Analytics

TradeLog is a trading journal and analytics web application built with Next.js, React, Tailwind CSS, Prisma, and PostgreSQL. It allows traders to systematically record trades across Forex and Indian Markets, track performance across custom strategies, visualize daily outcomes on an interactive calendar, and analyze growth with rich charts.

---

## Features

- **Multi-Market Support**: Separate tracking for Forex & Global Markets and Indian Market.
- **Instrument & Strategy Management**: Create custom instruments and define multiple strategies per instrument (e.g. `5EMA 1:3`, `Breakout`).
- **Trade Recording**: Log Target (TP) and Stop Loss (SL) values with timestamp (IST), instant validation, and outcome computation.
- **Interactive Visual Calendar**:
  - Color-coded daily tiles highlighting net TP (emerald) and net SL (rose) days.
  - Click any day to open the day panel to view, add, edit, or delete trades.
- **Analytics & Charts**:
  - **Cumulative Outcome Growth (P/L)**: Track account growth over time with a zero baseline.
  - **Target vs Stop Loss Ratio**: Donut distribution showing total executions.
  - **Daily Net Outcomes Breakdown**: Daily bar chart with positive and negative net outcomes.
  - **Dynamic Range Filters**: Switch between Week, Month, 3 Months, All, or select a **Custom** calendar date range.
- **Recorded Trades Table**: Grouped by date with month name display, filterable by month, with pagination and inline edit/delete.
- **User Authentication**: Secure session-based authentication with password change support.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM**: PostgreSQL via [Prisma](https://www.prisma.io/)
- **Charts**: [Recharts](https://recharts.org/)
- **Date Handling**: [date-fns](https://date-fns.org/) & [date-fns-tz](https://github.com/marnusw/date-fns-tz)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dineesh07/Trade-Log.git
   cd Trade-Log
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and configure your database connection string and session secret:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/tradelog?schema=public"
   SESSION_SECRET="your-secret-key-at-least-32-chars"
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed initial data (optional):
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

Run unit tests with Vitest:
```bash
npm run test
```

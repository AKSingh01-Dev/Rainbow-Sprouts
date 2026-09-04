# The Store

Production scaffold for a storefront with:
- Public product catalog (live-editable from an admin panel — no redeploy needed)
- Buyer login via phone OTP or email OTP
- Cart + checkout with Razorpay payments (UPI/cards/netbanking)
- Admin dashboard: manage products, and see every order — buyer, products, delivery address, timestamp, status

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create accounts and get API keys**
   - [Supabase](https://supabase.com) → new project → copy the Postgres connection string
   - [Razorpay](https://razorpay.com) → sign up → get **test mode** keys first
   - [Resend](https://resend.com) → get an API key for email OTP
   - [MSG91](https://msg91.com) (or Twilio) → get an auth key + OTP template for SMS

3. **Configure environment variables**
   ```
   cp .env.example .env
   ```
   Fill in every value in `.env`.

4. **Set up the database**
   ```
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   This creates the tables and one admin user (`admin@example.com` by default —
   change it in `prisma/seed.ts` first, or log in with that email OTP flow
   and it'll already have admin rights).

5. **Run it**
   ```
   npm run dev
   ```
   Visit `http://localhost:3000` for the storefront, `/admin` for the admin panel.

6. **Go live**
   - Push to GitHub, import the repo into [Vercel](https://vercel.com)
   - Add the same environment variables in Vercel's project settings
   - Switch Razorpay from test keys to live keys once you've tested a full purchase
   - Point your domain at the Vercel deployment

## Project structure
```
src/app/              → pages (storefront + admin) and API routes
src/lib/               → prisma client, OTP logic, session/JWT, Razorpay
src/components/        → CartContext, ProductCard
prisma/schema.prisma   → database schema
```

## Notes
- Prices are stored in **paise** (e.g. ₹499.00 = 49900) to avoid floating-point rounding bugs.
- Payment is only marked "paid" after the Razorpay signature is verified server-side (`/api/razorpay/verify`) — never trust the client alone.
- `/admin/*` is protected by `src/middleware.ts`; only users with `isAdmin: true` can reach it.
- Cart state currently lives in memory (resets on refresh). If you want it to persist, store it against the logged-in user in the database instead of localStorage.

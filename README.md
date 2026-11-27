# LinkLedger

LinkLedger connects advertisers and publishers for sponsored content partnerships. The current app includes basic role-based registration and authentication.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a MySQL connection string. Set `SESSION_PASSWORD` to a random secret of at least 32 characters.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the checked-in migrations with `npm run db:migrate`.
5. Start the app with `npm run dev`.

Create the first admin only after the database migration is applied: set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 16 characters), then run `npm run db:seed:admin`. The seed refuses to promote an existing non-admin account and does not update an existing admin.

Advertiser and publisher accounts share the `User` table. Login sessions are stored in the database and protected by encrypted, HTTP-only cookies. Set a strong `SESSION_PASSWORD` in every production environment; the development fallback must never be used in production.

## Payments

Choose Razorpay or Stripe in the marketplace checkout. For Razorpay, use Test Mode first and configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env`. Never expose `RAZORPAY_KEY_SECRET`.

Register `https://your-domain/api/webhooks/razorpay` in Razorpay and enable payment authorized, captured, failed, and refund events. Confirmation occurs only after provider payment capture validation. Duplicate and delayed webhooks are protected by provider event IDs.

For Stripe Checkout, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_BASE_URL`. Register `https://your-domain/api/webhooks/stripe` and enable `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, and `charge.refunded`. Keep all secret keys server-side.

## Checks

- `npm run lint`
- `npx tsc --noEmit`
- `npx prisma validate`

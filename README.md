# Twigthetics

Twigthetics is a Next.js site with:

- a public coaching landing page at `/`
- member login at `/login`
- member dashboard routes under `/member`
- coach admin route at `/admin`

## Local development

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

If Supabase is not configured, the portal runs in demo mode locally so you can still preview:

- member login flow
- admin login flow
- plans
- documents
- billing screens
- inbox UI

Set `PORTAL_PREVIEW_MODE=1` on Render if you want the deployed site to keep showing the demo member/admin portal before live auth and billing are connected.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have available.

Required for the public site:

- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_GUIDE_CHECKOUT_URL`
- `NEXT_PUBLIC_APPLICATION_ENDPOINT`

Required for the live member portal:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_COACHING_PRICE_ID`

## Supabase setup

Run the SQL in [supabase/schema.sql](/Users/abeseth/Documents/twigthetics/supabase/schema.sql) inside your Supabase project.

Create a storage bucket named `member-documents`.

Create one admin profile row with `role = 'coach_admin'` for your own auth user.

## Render deployment

The project includes [render.yaml](/Users/abeseth/Documents/twigthetics/render.yaml) for Render.

Recommended Render setup:

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from that repo.
3. Use the `Starter` plan for the app.
4. Add the environment variables from `.env.example`.
5. Set the production domain in `NEXT_PUBLIC_SITE_URL`.
6. Add your custom domain after the first deploy succeeds.

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run start
```

## Notes

- Render is the app host.
- Supabase handles auth, database, storage, and portal data.
- Stripe handles checkout, subscriptions, and billing portal access.

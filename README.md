# Tupelo Honey Spa

A modern, mobile-first website and booking experience for [Tupelo Honey Spa](https://tupelohoneyspa.com), a spa and wellness collective in Elma, New York.

## Current phase

The website is fully implemented with production-oriented UI, responsive pages, service discovery, team profiles, and a complete demo booking flow. Square is intentionally isolated behind a booking provider interface and is not connected yet.

The demo does not create appointments, charge cards, or send contact messages.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- Next.js App Router and TypeScript
- Tailwind CSS 4
- Server Components by default; client components only for interactive flows
- `src/lib/booking` provider boundary for mock and future Square implementations
- Route handlers under `src/app/api/booking`
- Centralized service and team content in `src/data/site.ts`

## Production integrations still required

- Square OAuth and production credentials
- Square Catalog, Team, Customers, Bookings, Payments, and webhooks
- WordPress media migration to local or managed storage
- Contact form delivery
- Analytics and consent configuration
- Production domain and DNS

Holli Simme continues to use her independent Square booking site by design.

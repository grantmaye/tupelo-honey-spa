# Tupelo Honey Spa

A modern, mobile-first website and booking experience for [Tupelo Honey Spa](https://tupelohoneyspa.com), a spa and wellness collective in Elma, New York.

## Current phase

The website is fully implemented with production-oriented UI, responsive pages, service discovery, individual team profiles, an on-site gift card checkout, and a complete demo booking flow. Square is intentionally isolated behind server-side integration boundaries and is not connected yet.

Without production environment credentials, the demo does not create appointments, charge cards, send gift cards, or send contact messages.

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

## Content administration

The recommended production setup keeps the existing WordPress dashboard as a headless CMS. Holli or another authorized editor continues using the familiar WordPress admin to update homepage announcements, team biographies, hours, images, events, and SEO copy. The Next.js site reads those published changes through the WordPress REST API and revalidates automatically through a webhook.

Square is the single source of truth for bookable service names, prices, durations, availability, and team-member service assignments. The site reads those records through the Catalog and Bookings APIs. A `catalog.version.updated` webhook invalidates the website cache after a Square catalog change so editors never need to update pricing in two systems.

Until WordPress administrator access and a stable CMS URL are provided, the site uses the local fallback content in `src/data/site.ts`. Do not expose a custom unauthenticated `/admin` route; WordPress remains the authenticated editorial backend.

## On-site Square gift cards

The `/gift-cards` experience is complete but remains in preview mode until these variables are configured:

```bash
NEXT_PUBLIC_SQUARE_APPLICATION_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
SQUARE_LOCATION_ID=
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox
SQUARE_API_VERSION=2026-05-20
RESEND_API_KEY=
GIFT_CARD_FROM_EMAIL="Tupelo Honey Spa <giftcards@example.com>"
```

The server creates and pays a `GIFT_CARD` order, creates the digital card, activates it, and then delivers its redemption code by email. If creation or activation fails after payment, the route attempts an automatic full refund.

## Production integrations still required

- Square OAuth and production credentials for bookings and gift cards
- Square Catalog, Team, Customers, Bookings, Payments, and webhooks
- WordPress headless CMS connection, content models, and revalidation webhook
- Contact form delivery
- Analytics and consent configuration
- Production domain and DNS

Holli Simme continues to use her independent Square booking site by design.

Contact-form delivery is intentionally deferred until the production domain and sending domain are configured.

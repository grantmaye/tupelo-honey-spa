# Tupelo Honey Spa

A modern, mobile-first website and on-site booking experience for [Tupelo Honey Spa](https://tupelohoneyspa.com), a spa and wellness collective in Elma, New York.

## Current production status

- The Next.js application is live on Vercel at the apex domain, with `www` redirecting to the canonical host.
- Square Production is the source of truth for service names, prices, durations, practitioner assignments, availability, appointments, payments, and digital gift cards.
- WordPress at `cms.tupelohoneyspa.com` is the editorial CMS for brand and page content.
- A controlled true-card website booking completed successfully end to end on July 20, 2026.
- A controlled production gift-card transaction completed successfully end to end on July 20, 2026.
- Holli Simme continues to use her independent Square booking site by design.
- Contact-form and gift-card delivery use Resend.

These confirmations are acceptance evidence, not synthetic health checks. Repeat a controlled transaction after a material payment, booking, Square, or checkout change. Never record customer details, card data, credentials, secret environment values, or recovery codes in repository documentation.

## Ownership and operating model

Tupelo Honey Spa owns its business assets: the domain and registration, authoritative DNS, Square merchant account, customer and business data, business email identity, and client-controlled content and accounts.

M1 owns and controls the GitHub repository, Vercel project, and M1-managed implementation IP by default unless a written agreement provides for an IP purchase or transfer. If a client leaves while the IP remains M1-managed, access, exports, continuity, and any contractually required transfers are handled through the documented offboarding process.

See [Client Infrastructure Onboarding and Ownership SOP](docs/CLIENT-INFRASTRUCTURE-ONBOARDING-SOP.md) for the complete boundary.

## Editing website content

Authorized editors use the existing WordPress dashboard and Elementor. Publishing a WordPress page updates the corresponding content on the Next.js site; WordPress content is cached for up to five minutes, with local fallbacks so a temporary WordPress outage does not blank the site.

The website currently reads these WordPress pages:

- `home-2` — homepage image, Janell announcement, gift-card copy, purpose statement, and offerings title
- `services` — services-page introduction
- `parties-special-events` — event copy and gallery
- Practitioner pages — profile photo, professional role, and full biography

For immediate refreshes, configure `WORDPRESS_REVALIDATE_SECRET` in Vercel and have WordPress send a `POST` request to `/api/revalidate/wordpress` with the same value in the `x-wordpress-revalidate-secret` header. The endpoint is intentionally unavailable without a secret.

Square remains the only place to edit bookable services, pricing, durations, availability, and staff-service assignments. Those fields should not be duplicated in WordPress.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment-variable contract

Copy `.env.example` to `.env.local` and supply values through the approved local or Vercel secret-management workflow. The application expects:

```text
NEXT_PUBLIC_SQUARE_APPLICATION_ID
SQUARE_LOCATION_ID
SQUARE_ACCESS_TOKEN
SQUARE_ENVIRONMENT
SQUARE_API_VERSION
WORDPRESS_API_URL
NEXT_PUBLIC_WORDPRESS_SITE_URL
WORDPRESS_REVALIDATE_SECRET
RESEND_API_KEY
GIFT_CARD_FROM_EMAIL
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
```

Production WordPress URLs point to `https://cms.tupelohoneyspa.com`. Server-side `SQUARE_LOCATION_ID` is the sole Square location authority; do not reintroduce a duplicate public location override.

`SQUARE_ACCESS_TOKEN`, `WORDPRESS_REVALIDATE_SECRET`, and `RESEND_API_KEY` are server-only secrets. Never prefix them with `NEXT_PUBLIC_`, commit their values, or paste them into tickets, pull requests, screenshots, or chat.

## Architecture

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4
- Server Components for WordPress and Square reads
- WordPress REST API with five-minute tagged caching and secure on-demand revalidation
- Square Catalog, Team, Locations, and Bookings API reads behind server-only modules
- Provider boundary under `src/lib/booking` for live availability, customer matching/creation, and idempotent appointment creation
- Local content fallbacks in `src/data/site.ts` and `src/lib/wordpress.ts`

## Production operations

- [Go-live checklist and launch outcome](docs/GO-LIVE-CHECKLIST.md)
- [Production launch and rollback SOP](docs/PRODUCTION-LAUNCH-SOP.md)
- [Production monitoring and recovery program](docs/PRODUCTION-MONITORING-RECOVERY.md)

# Tupelo Honey Spa

A modern, mobile-first website and on-site booking experience for [Tupelo Honey Spa](https://tupelohoneyspa.com), a spa and wellness collective in Elma, New York.

## Current integration status

- Square production is the live source for service names, prices, durations, practitioner assignments, and appointment availability at the Elma location.
- WordPress is the live editorial CMS for the homepage hero and announcement, gift-card and brand copy, services introduction, special-events content, and practitioner photos, roles, and biographies.
- Appointment creation is implemented through Square and must pass the controlled production test in `docs/GO-LIVE-CHECKLIST.md` before DNS cutover.
- Holli Simme continues to use her independent Square booking site by design.
- Contact-form and gift-card delivery use Resend and require a verified sender plus the production environment variables listed below.

## Editing website content

Authorized editors continue to use the existing WordPress dashboard and Elementor. Publishing a WordPress page updates the corresponding content on the Next.js site; WordPress content is cached for up to five minutes, with local fallbacks so a temporary WordPress outage does not blank the site.

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

## Environment variables

Copy `.env.example` to `.env.local` and provide the appropriate environment values:

```bash
NEXT_PUBLIC_SQUARE_APPLICATION_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
SQUARE_LOCATION_ID=
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox
SQUARE_API_VERSION=2026-05-20
WORDPRESS_API_URL=https://tupelohoneyspa.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_SITE_URL=https://tupelohoneyspa.com
WORDPRESS_REVALIDATE_SECRET=
RESEND_API_KEY=
GIFT_CARD_FROM_EMAIL="Tupelo Honey Spa <giftcards@example.com>"
CONTACT_FROM_EMAIL="Tupelo Honey Spa <hello@example.com>"
CONTACT_TO_EMAIL=tupelohoneyspa@gmail.com
```

`SQUARE_ACCESS_TOKEN`, `WORDPRESS_REVALIDATE_SECRET`, and `RESEND_API_KEY` are server-only secrets. Never prefix them with `NEXT_PUBLIC_` or commit their values.

## Architecture

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4
- Server Components for WordPress and Square reads
- WordPress REST API with five-minute tagged caching and secure on-demand revalidation
- Square Catalog, Team, Locations, and Bookings API reads behind server-only modules
- Provider boundary under `src/lib/booking` for live availability, customer matching/creation, and idempotent appointment creation
- Local content fallbacks in `src/data/site.ts` and `src/lib/wordpress.ts`

## Production launch

- [Go-live checklist](docs/GO-LIVE-CHECKLIST.md)
- [Production launch and rollback SOP](docs/PRODUCTION-LAUNCH-SOP.md)

## Gift cards

The on-site gift-card checkout and Square payment route are implemented. Before enabling real purchases, payment, activation, delivery email, and refund behavior should be validated with a controlled transaction. Personal-message fields are shown only when the card is being sent to someone else.

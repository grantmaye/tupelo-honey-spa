# Tupelo Honey Spa — Go-Live Record and Checklist

**Original change window:** July 16, 2026, evening (America/New_York)  
**Change commander:** Grant Maye  
**Technical owner:** M1 Software  
**Production application:** M1-controlled Vercel project  
**Source repository:** M1-controlled GitHub repository  
**Authoritative DNS:** Cloudflare  
**Headless CMS:** `cms.tupelohoneyspa.com`

## Launch outcome — July 20, 2026

The Next.js application is live on the public domain and the production acceptance flow is confirmed:

- A controlled true-card website booking completed successfully end to end.
- A controlled production gift-card transaction completed successfully end to end.
- The operator reported that both flows worked as expected.
- No customer details, card data, transaction identifiers, credentials, recovery codes, or secret environment values are recorded in this document.

The unchecked items below are retained as a reusable launch/reverification checklist; they do not mean the July 20 acceptance transactions are still outstanding. Post-launch operational work is tracked in [Production Monitoring and Recovery](PRODUCTION-MONITORING-RECOVERY.md).

## GO/NO-GO gates for a future material cutover

- [ ] Current CMS/database/media backup completed and timestamp recorded.
- [ ] Current DNS zone exported.
- [ ] Cloudflare ownership, M1 delegated access, MFA, and recovery paths verified.
- [ ] Every live DNS record reconciled before a nameserver or zone migration.
- [ ] CMS hostname, TLS, admin, REST API, and representative media verified.
- [ ] Correct Vercel project contains all required Production environment variables.
- [ ] Square health endpoint returns a successful connected response.
- [ ] A controlled Square appointment is created once, appears correctly in Square, and is canceled or otherwise reconciled.
- [ ] A controlled gift-card transaction verifies payment, activation, delivery, and redemption-code display; refund/void is completed when required by the test plan.
- [ ] Contact form delivery and reply routing work.
- [ ] Approved build and deployment are READY.
- [ ] Desktop and mobile smoke tests pass without critical console or runtime errors.
- [ ] Last known-good deployment and rollback operator are identified.
- [ ] Client acceptance tester and support escalation path are confirmed.

If an applicable gate fails, declare **NO-GO** and remediate or roll back instead of accepting degraded booking, payment, data, email, or security behavior.

## Production environment-variable contract

The application expects the following variable names in the correct Vercel project and environment:

- `SQUARE_ACCESS_TOKEN` — Sensitive and server-only
- `SQUARE_ENVIRONMENT`
- `SQUARE_API_VERSION`
- `SQUARE_LOCATION_ID` — sole location authority
- `NEXT_PUBLIC_SQUARE_APPLICATION_ID`
- `WORDPRESS_API_URL`
- `NEXT_PUBLIC_WORDPRESS_SITE_URL`
- `WORDPRESS_REVALIDATE_SECRET` — Sensitive and server-only
- `RESEND_API_KEY` — Sensitive and server-only
- `GIFT_CARD_FROM_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Do not add a second public Square location variable. Do not place secret values in this checklist, source control, pull requests, tickets, screenshots, or chat. After any production environment change, redeploy before testing.

## Public DNS cutover checklist

Only after all applicable gates pass:

- [ ] Confirm apex and `www` are attached to the correct production project.
- [ ] Copy the exact DNS targets Vercel displays at change time.
- [ ] Make website DNS changes in Cloudflare, not in a non-authoritative registrar zone.
- [ ] Preserve CMS, email, verification, and unrelated records.
- [ ] Record cutover start time: __________ ET.
- [ ] Change only the intended website records.
- [ ] Verify apex and `www` from a second network.
- [ ] Verify HTTPS and the canonical redirect.
- [ ] Monitor throughout at least one DNS TTL and the defined change window.

## Post-change smoke test

- [ ] `/`, `/services`, `/book`, `/gift-cards`, `/about`, `/team`, `/special-events`, and `/contact` return successfully.
- [ ] Logo, hero, event gallery, and active team photos load from the CMS.
- [ ] Navigation, keyboard access, touch behavior, and route scroll position work.
- [ ] Square prices, durations, bookable providers, and availability are live.
- [ ] Provider/service routing matches the current business rules.
- [ ] Holli’s booking action opens her independent Square site.
- [ ] Contact form sends exactly one message.
- [ ] Gift-card purchase modes show only relevant fields.
- [ ] Vercel runtime logs show no recurring integration failures.
- [ ] Square shows no duplicate bookings, payments, activations, or orphaned records.
- [ ] Transactional email delivery logs show the expected single delivery.
- [ ] The acceptance result and evidence location are recorded without sensitive data.

## Immediate rollback triggers

Rollback immediately for duplicate charges/bookings, credential exposure, security incidents, customer-data leakage, or a critically broken public site, CMS, booking, payment, or gift-card flow that cannot be restored within the approved incident window.

- [ ] Stop further production tests.
- [ ] Promote the last known-good Vercel deployment when the fault is application-only.
- [ ] Use the documented DNS rollback only when the application/domain path cannot be recovered quickly.
- [ ] Preserve the CMS path and relevant non-sensitive evidence.
- [ ] Confirm the restored public path and critical customer flows.
- [ ] Record rollback time, cause, affected window, and reconciliation owner.
- [ ] Notify the client using the incident communication path.

A rollback drill and restore rehearsal remain required even though production acceptance succeeded.

## Ownership follow-up

- [ ] Client domain/registrar ownership, renewal, MFA, and recovery are verified.
- [ ] Client Cloudflare ownership and delegated M1 access are verified.
- [ ] Client Square ownership and delegated M1 developer access are verified.
- [ ] Client business email, customer data, and business records are recoverable.
- [ ] M1 GitHub and Vercel ownership, MFA, recovery, billing, and production access are verified.
- [ ] Written IP purchase/transfer exceptions, if any, are attached to the client record.
- [ ] Offboarding obligations and export paths are documented.

See [Client Infrastructure Onboarding, Ownership, and Offboarding SOP](CLIENT-INFRASTRUCTURE-ONBOARDING-SOP.md).

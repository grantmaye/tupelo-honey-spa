# Client Infrastructure Onboarding, Ownership, and Offboarding SOP

## Purpose

This SOP defines ownership and access for M1 Software client launches involving a domain, DNS, email, website, CMS, source code, deployment platform, payment/booking systems, analytics, and other business systems.

The model separates **client business assets** from **M1-managed software and delivery assets**. Exceptions require a written agreement; they are never inferred from day-to-day administrative access.

## Non-negotiable ownership model

### Client-owned business assets

The client owns, at minimum:

- its domain name, registrar account, registrant identity, renewal method, and recovery path;
- its authoritative DNS zone and business-controlled Cloudflare account;
- its merchant, booking, and payment accounts, including Square;
- its customer data, transaction records, business records, and legally required exports;
- its business email identity and mailboxes;
- its client-controlled content, analytics/search properties, and other accounts identified as client assets in the agreement.

M1 normally receives delegated, least-privilege administrative or developer access to those assets. M1 must not become the only recoverable administrator or the accidental owner through an employee identity or payment card.

### M1-owned managed-service assets

Unless a written agreement states otherwise, M1 owns and controls:

- the GitHub organization/repository and its administrative settings;
- the Vercel team/project and its production deployment controls;
- M1-developed implementation IP, tooling, and managed delivery infrastructure.

A purchase or transfer of IP must be documented in writing, including the transfer scope, payment/acceptance conditions, retained M1 tooling, export format, and timing. If the client leaves while the IP remains M1-managed, the client moves through the formal offboarding process; access and continuity obligations are determined by the agreement rather than by informal account access.

### Access, security, and records

- Accounts for client-owned assets use a client-controlled business identity whenever the provider permits it.
- Accounts for M1-owned assets use an M1-controlled role or service identity.
- Both parties enable MFA and maintain approved recovery paths.
- Recovery codes and credentials belong in approved password vaults, never in chat, email, tickets, source code, screenshots, or operational documents.
- Billing follows ownership unless the agreement explicitly defines a managed pass-through arrangement.
- The client record must name the owner, M1 role, MFA state, billing owner, recovery owner, renewal date, and transfer/offboarding rule for every system.

## Standard target stack

| Layer | Default owner | M1 access | Standard role |
| --- | --- | --- | --- |
| Registrar/domain | Client | Delegated manager where supported | Registration, renewal, registrant data |
| Cloudflare/DNS | Client | Administrator/DNS | Authoritative DNS, security, DNSSEC |
| Square | Client | Developer/team access | Catalog, appointments, payments |
| Business email | Client | Mail/domain administrator | Human mailbox and replies |
| Customer/business data | Client | Least privilege required for service | Records, exports, retention |
| CMS/content account | Client unless contract says otherwise | Application/admin access | Editorial content and media |
| Analytics/Search | Client | Administrator | Measurement and search ownership |
| GitHub/source repository | M1 unless written transfer agreement | M1 owner/maintainer; client access per agreement | Source, reviews, history |
| Vercel/production deployment | M1 unless written transfer agreement | M1 owner/admin | Production frontend and APIs |
| M1 implementation IP/tooling | M1 unless purchased/transferred in writing | M1-controlled | Managed software delivery |

Document every contract-specific exception in the client record with its export and offboarding procedure.

## Intake: information required before work begins

Send one secure intake request. Never ask the client to email or paste passwords, API tokens, recovery codes, or payment credentials.

1. Legal business name, owner, billing contact, technical approver, and support contacts.
2. Domain names, registrar, expiration dates, auto-renewal state, and registrant identity.
3. Current DNS provider and a complete zone export.
4. Current website host, CMS, repository, CDN, analytics, and tag manager.
5. Business mailboxes, aliases, forwarding rules, mailing lists, and sending services.
6. Payment, booking, CRM, marketing, forms, and automation platforms.
7. Existing SPF, DKIM, DMARC, verification, MX, SRV, CAA, and DNSSEC records.
8. Written authorization naming M1 as the technical implementation partner.
9. The commercial ownership terms for code, Vercel, GitHub, content, data, and offboarding.
10. A maintenance window, rollback approver, and client-side acceptance tester.

## Access workflow

The client grants access to client-owned assets; M1 performs and documents the technical work.

1. Hold a recorded onboarding call with the owner or authorized administrator when access recovery or delegation needs supervision.
2. Have the client sign in to client-owned providers and use **Invite user**, **Delegate access**, **Share access**, or **Add team member**.
3. Invite the named M1 operations identity with the least privilege that can complete and support the project.
4. When a provider has no delegation feature, use a supervised screen share, a temporary expiring vault share, or a provider-supported transfer into a client-owned account.
5. Verify M1 access before ending the session.
6. Record the provider, owner, M1 role, MFA state, recovery owner, renewal owner, date granted, and offboarding rule.
7. Rotate temporary credentials and revoke temporary shares when onboarding is complete.
8. Provision GitHub and Vercel under the M1-controlled organization/team unless the written agreement establishes a different owner.

## Domain and DNS procedure

1. Confirm the registrar and authoritative nameservers publicly.
2. Export the complete live zone and capture DNSSEC/DS state before changes.
3. Create or confirm the client-owned Cloudflare account and invite M1 as administrator.
4. Import and reconcile every record against the source export.
5. Preserve website and email destinations during any nameserver change.
6. Handle legacy DS records according to the previous and new DNS providers’ DNSSEC instructions.
7. Change nameservers at the registrar; do not maintain a competing production zone after delegation.
8. Wait for Cloudflare to report Active and verify NS, website, email, and critical records publicly.
9. After authority is stable, enable DNSSEC and publish the Cloudflare DS record at the registrar.
10. Record the final nameservers, DNSSEC state, zone export, validation evidence, and rollback values.

## Website and headless CMS procedure

1. Back up the existing website, database, media, and server configuration.
2. Keep WordPress on a dedicated origin such as `cms.example.com` with valid TLS.
3. Confirm admin access, REST API, media URLs, and publishing before moving the public domain.
4. Configure production environment variables in Vercel; secrets must be server-only and marked Sensitive.
5. Deploy and test on a Vercel deployment URL before adding public domains.
6. Add apex and `www` to the correct M1-controlled Vercel project, use the exact DNS targets Vercel supplies, and select one canonical hostname.
7. Validate HTTPS, redirects, metadata, analytics, forms, CMS revalidation, booking/payment boundaries, and rollback.

## Business email procedure

1. Inventory every mailbox and sender before changing DNS.
2. Create mailboxes and aliases in the client-owned email service.
3. Publish provider-supplied MX and client-discovery records as DNS-only where required.
4. Publish exactly one SPF record at the apex and include every authorized sender.
5. Publish DKIM selectors for every service that sends as the client domain.
6. Start DMARC at `p=none` with a monitored aggregate-report destination.
7. Test inbound delivery, retained copy, forwarding, outbound mail, replies, and spam placement.
8. Verify SPF, DKIM, and DMARC alignment in received-message authentication results.
9. After at least 2–4 weeks of clean reports and sender inventory, stage enforcement through quarantine and then reject; use percentage rollouts and rollback criteria.
10. Keep human mailbox email separate from transactional application email where practical.

## Tupelo Honey reference configuration

- Domain and registrar: owned by Tupelo Honey Spa through its Namecheap account.
- Authoritative DNS: client-owned Cloudflare zone with delegated M1 administrative access.
- Public application: M1-owned and controlled Vercel project at `tupelohoneyspa.com`; `www` redirects to the apex.
- Source and deployment history: M1-owned and controlled GitHub repository.
- CMS: WordPress at `cms.tupelohoneyspa.com`; content and data ownership follow the client agreement.
- Human mailbox and business email identity: client-owned; M1 may administer under the service agreement.
- Booking, catalog, appointments, payments, and gift cards: client-owned Square Production account with delegated M1 developer access.
- Customer and transaction data: client-owned.
- Current DMARC phase: monitoring. DNSSEC, staged DMARC enforcement, production alerting, restore rehearsal, and rollback drill remain open operational work.
- Production acceptance on July 20, 2026: one true-card website booking and one controlled gift-card transaction completed successfully end to end. No customer, card, transaction, credential, or secret values are recorded here.

## Verification gate

Do not call onboarding and production acceptance complete until applicable checks pass:

- Registrar ownership, renewal, MFA, and recovery contact documented.
- Cloudflare active; zone exported; DNSSEC state documented.
- Apex, `www`, CMS, TLS, canonical redirects, and rollback tested.
- Email inbound, forwarding, retained copy, outbound, SPF, DKIM, and DMARC verified.
- M1 ownership, administrative access, MFA, billing, recovery, and deploy rights verified for GitHub and Vercel.
- WordPress editor login, REST API, media, backup, and cache revalidation tested.
- Square health, catalog, availability, controlled booking, and payment/gift-card boundaries tested.
- Client acceptance test completed and support escalation path understood.
- Access register, system diagram, monitoring plan, and recovery evidence stored in the client record.

## Ongoing operations

Use [Production Monitoring and Recovery](PRODUCTION-MONITORING-RECOVERY.md) for alerting, cron visibility, backups, restore rehearsals, rollback drills, DNSSEC, and staged DMARC enforcement.

Review access, recovery, renewals, and ownership quarterly. Remove departed users promptly and rotate exposed or shared credentials through provider-approved workflows.

## Offboarding

1. Confirm the written agreement, ownership register, outstanding invoices, effective termination date, and required continuity period.
2. Inventory client-owned assets, M1-owned assets, contractually purchased/transferred IP, access roles, integrations, and data/export obligations.
3. Export client-owned content, customer/business data, DNS records, and other contractually required material in documented formats.
4. Transfer only assets the agreement identifies as client-owned or purchased/transferred. GitHub, Vercel, and M1-managed IP remain M1-owned unless the written agreement says otherwise.
5. When IP is being transferred, create an explicit transfer plan covering repository history, deployment configuration, third-party dependencies, licenses, secrets rotation, and acceptance.
6. Remove or reduce M1 access to client-owned assets after acceptance and any support-transition window.
7. Remove client access to M1-owned systems when contractually appropriate without destroying required client data or continuity evidence.
8. Rotate credentials, revoke integrations, update billing and recovery ownership, and confirm domain/email continuity.
9. Obtain written acceptance and retain the non-secret offboarding record.

## Setup-fee scope

The setup fee covers discovery, access recovery, ownership mapping, zone and sender inventory, backups, migrations, DNS/email authentication, controlled testing, documentation, and handoff. Quote exceptions separately when ownership is disputed, an asset has no recoverable owner, the domain is locked, mailboxes require migration, multiple sending platforms need alignment, or a legacy provider cannot delegate access.

## Client access register template

| System | Owner | M1 role | MFA | Billing owner | Recovery owner | Renewal/date | Transfer/offboarding rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Registrar/domain |  |  |  |  |  |  |  |
| Cloudflare/DNS |  |  |  |  |  |  |  |
| Hosting/CMS |  |  |  |  |  |  |  |
| Vercel |  |  |  |  |  |  |  |
| Email |  |  |  |  |  |  |  |
| Square |  |  |  |  |  |  |  |
| GitHub |  |  |  |  |  |  |  |
| Analytics/Search |  |  |  |  |  |  |  |
| Customer/business data |  |  |  |  |  |  |  |

## Change record

- Client/project: ____________________
- Date: ____________________
- Change owner: ____________________
- Ownership exceptions/contract reference: ____________________
- Source zone export: ____________________
- Backup location: ____________________
- Approved maintenance window: ____________________
- Production deployment/commit: ____________________
- Email authentication verified: ____________________
- Client acceptance: ____________________
- Ownership register delivered: ____________________
- Monitoring/recovery record: ____________________
- Follow-up review date: ____________________
